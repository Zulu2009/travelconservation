import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CloudTasksClient } from '@google-cloud/tasks';

// Initialize Cloud Tasks client
const tasksClient = new CloudTasksClient();

interface ScrapingTask {
  operator_id: string;
  operator_url: string;
  tier: 'tier1' | 'tier2';
  priority: number;
  retry_count?: number;
  created_at?: string;
}

// Removed unused interface

// Cloud Tasks configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const LOCATION = 'us-central1';
const TIER1_QUEUE = 'tier1-scraping-queue';
const TIER2_QUEUE = 'tier2-scraping-queue';

/**
 * Create scraping tasks in Cloud Tasks queues
 */
export const createScrapingTask = functions.https.onRequest(async (request, response) => {
  try {
    const taskData: ScrapingTask = request.body;
    
    if (!taskData.operator_id || !taskData.operator_url || !taskData.tier) {
      response.status(400).json({
        success: false,
        error: 'Missing required fields: operator_id, operator_url, tier'
      });
      return;
    }
    
    console.log(`📋 Creating scraping task for ${taskData.operator_id} (${taskData.tier})`);
    
    // Choose queue based on tier
    const queueName = taskData.tier === 'tier1' ? TIER1_QUEUE : TIER2_QUEUE;
    const queuePath = tasksClient.queuePath(PROJECT_ID, LOCATION, queueName);
    
    // Create task payload
    const taskPayload = {
      operator_id: taskData.operator_id,
      operator_url: taskData.operator_url,
      tier: taskData.tier,
      priority: taskData.priority,
      created_at: new Date().toISOString()
    };
    
    // Configure task timing based on tier
    const scheduleTime = getTaskScheduleTime(taskData.tier, taskData.priority);
    
    const task = {
      httpRequest: {
        httpMethod: 'POST' as const,
        url: getScrapingServiceUrl(taskData.tier),
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify(taskPayload)),
      },
      scheduleTime: scheduleTime,
    };
    
    // Create the task
    const [createdTask] = await tasksClient.createTask({
      parent: queuePath,
      task: task,
    });
    
    const taskId = createdTask.name?.split('/').pop() || 'unknown';
    
    // Store task metadata in Firestore
    await storeTaskMetadata(taskId, taskData, queueName);
    
    console.log(`✅ Task created: ${taskId} in queue ${queueName}`);
    
    response.json({
      success: true,
      task_id: taskId,
      queue_name: queueName,
      scheduled_time: scheduleTime,
      operator_id: taskData.operator_id
    });
    
  } catch (error) {
    console.error('❌ Error creating scraping task:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get task schedule time based on tier and priority
 */
function getTaskScheduleTime(tier: 'tier1' | 'tier2', priority: number): any {
  const now = new Date();
  let delaySeconds = 0;
  
  if (tier === 'tier1') {
    // Tier 1: Process immediately for high priority, small delays for others
    delaySeconds = priority >= 8 ? 0 : (10 - priority) * 30; // 0-60 seconds
  } else {
    // Tier 2: Longer delays to manage costs
    delaySeconds = (10 - priority) * 60; // 0-300 seconds (5 minutes max)
  }
  
  const scheduleTime = new Date(now.getTime() + delaySeconds * 1000);
  
  return {
    seconds: Math.floor(scheduleTime.getTime() / 1000),
    nanos: (scheduleTime.getTime() % 1000) * 1000000,
  };
}

/**
 * Get scraping service URL based on tier
 */
function getScrapingServiceUrl(tier: 'tier1' | 'tier2'): string {
  const baseUrl = `https://${tier}-scraper-${PROJECT_ID}.a.run.app`;
  return `${baseUrl}/scrape`;
}

/**
 * Store task metadata in Firestore
 */
async function storeTaskMetadata(
  taskId: string, 
  taskData: ScrapingTask, 
  queueName: string
): Promise<void> {
  await admin.firestore().collection('scraping-tasks').doc(taskId).set({
    ...taskData,
    task_id: taskId,
    queue_name: queueName,
    status: 'queued',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Update task status
 */
export const updateTaskStatus = functions.https.onRequest(async (request, response) => {
  try {
    const { task_id, status, result_data, error_message } = request.body;
    
    if (!task_id || !status) {
      response.status(400).json({
        success: false,
        error: 'Missing required fields: task_id, status'
      });
      return;
    }
    
    const updateData: any = {
      status,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (result_data) {
      updateData.result_data = result_data;
    }
    
    if (error_message) {
      updateData.error_message = error_message;
      updateData.retry_count = admin.firestore.FieldValue.increment(1);
    }
    
    await admin.firestore().collection('scraping-tasks').doc(task_id).update(updateData);
    
    console.log(`📊 Task ${task_id} status updated to: ${status}`);
    
    // If task completed successfully, trigger analysis
    if (status === 'completed' && result_data) {
      await triggerAnalysis(task_id, result_data);
    }
    
    response.json({
      success: true,
      task_id,
      status
    });
    
  } catch (error) {
    console.error('❌ Error updating task status:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Trigger analysis after successful scraping
 */
async function triggerAnalysis(taskId: string, scrapedData: any): Promise<void> {
  try {
    // Get task details
    const taskDoc = await admin.firestore().collection('scraping-tasks').doc(taskId).get();
    const taskData = taskDoc.data();
    
    if (!taskData) {
      console.error(`Task ${taskId} not found`);
      return;
    }
    
    // Create analysis task
    const analysisPayload = {
      operator_id: taskData.operator_id,
      operator_url: taskData.operator_url,
      tier: taskData.tier,
      scraped_data: scrapedData,
      task_id: taskId
    };
    
    // Call analysis function
    const analysisUrl = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/analyzeOperator`;
    
    const response = await fetch(analysisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisPayload)
    });
    
    if (response.ok) {
      console.log(`✅ Analysis triggered for operator ${taskData.operator_id}`);
    } else {
      console.error(`❌ Failed to trigger analysis for ${taskData.operator_id}`);
    }
    
  } catch (error) {
    console.error('Error triggering analysis:', error);
  }
}

/**
 * Get queue statistics
 */
export const getQueueStats = functions.https.onRequest(async (request, response) => {
  try {
    const stats = {
      tier1_queue: await getQueueStatistics(TIER1_QUEUE),
      tier2_queue: await getQueueStatistics(TIER2_QUEUE),
      task_summary: await getTaskSummary()
    };
    
    response.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get statistics for a specific queue
 */
async function getQueueStatistics(queueName: string): Promise<any> {
  try {
    const queuePath = tasksClient.queuePath(PROJECT_ID, LOCATION, queueName);
    const [queue] = await tasksClient.getQueue({ name: queuePath });
    
    return {
      name: queueName,
      state: queue.state,
      task_count: 0, // Stats not available in current API version
      oldest_task: null,
      executed_last_minute: 0
    };
    
  } catch (error) {
    console.error(`Error getting stats for queue ${queueName}:`, error);
    return {
      name: queueName,
      error: 'Failed to fetch statistics'
    };
  }
}

/**
 * Get task summary from Firestore
 */
async function getTaskSummary(): Promise<any> {
  try {
    const tasksSnapshot = await admin.firestore().collection('scraping-tasks').get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    
    const summary = {
      total_tasks: tasks.length,
      by_status: {
        queued: tasks.filter(t => t.status === 'queued').length,
        processing: tasks.filter(t => t.status === 'processing').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length
      },
      by_tier: {
        tier1: tasks.filter(t => t.tier === 'tier1').length,
        tier2: tasks.filter(t => t.tier === 'tier2').length
      }
    };
    
    return summary;
    
  } catch (error) {
    console.error('Error getting task summary:', error);
    return { error: 'Failed to fetch task summary' };
  }
}

/**
 * Retry failed tasks
 */
export const retryFailedTasks = functions.https.onRequest(async (request, response) => {
  try {
    const { max_retries = 3 } = request.body;
    
    // Get failed tasks that haven't exceeded retry limit
    const failedTasksSnapshot = await admin.firestore()
      .collection('scraping-tasks')
      .where('status', '==', 'failed')
      .where('retry_count', '<', max_retries)
      .get();
    
    const retryTasks = [];
    
    for (const doc of failedTasksSnapshot.docs) {
      const taskData = doc.data();
      
      // Create new task
      const newTaskPayload = {
        operator_id: taskData.operator_id,
        operator_url: taskData.operator_url,
        tier: taskData.tier,
        priority: taskData.priority,
        retry_count: (taskData.retry_count || 0) + 1
      };
      
      // Create the retry task
      const retryResponse = await fetch(`https://us-central1-${PROJECT_ID}.cloudfunctions.net/createScrapingTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskPayload)
      });
      
      if (retryResponse.ok) {
        retryTasks.push(taskData.operator_id);
        
        // Update original task status
        await doc.ref.update({
          status: 'retried',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    console.log(`🔄 Retried ${retryTasks.length} failed tasks`);
    
    response.json({
      success: true,
      retried_count: retryTasks.length,
      retried_operators: retryTasks
    });
    
  } catch (error) {
    console.error('❌ Error retrying failed tasks:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
