// Removed unused import

// Analytics Engine - Pure JavaScript calculations
// No LLM usage, cost-effective metric calculations

export interface SupplierMetrics {
  trustScore: number;
  sustainabilityRating: number;
  conservationROI: number;
  communityROI: number;
  researchROI: number;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendationStrength: number;
}

export interface AnalyticsInput {
  supplierId: string;
  reviews: {
    averageRating: number;
    totalReviews: number;
    recentReviews: Array<{
      rating: number;
      date: string;
      verified: boolean;
    }>;
  };
  certifications: string[];
  conservationImpact: {
    projectsSupported: number;
    fundsRaised: number; // in USD
    speciesProtected: string[];
    communityBenefits: string;
  };
  financials: {
    annualRevenue: number;
    conservationSpending: number;
    communitySpending: number;
    researchSpending: number;
  };
  operations: {
    yearsInOperation: number;
    capacity: number;
    occupancyRate: number;
    localStaffPercentage: number;
  };
  verification: {
    lastAuditDate: string;
    auditScore: number; // 1-100
    complianceIssues: number;
  };
}

export class AnalyticsEngine {
  
  /**
   * Calculate comprehensive supplier metrics
   */
  static calculateSupplierMetrics(input: AnalyticsInput): SupplierMetrics {
    const trustScore = this.calculateTrustScore(input);
    const sustainabilityRating = this.calculateSustainabilityRating(input);
    const conservationROI = this.calculateConservationROI(input);
    const communityROI = this.calculateCommunityROI(input);
    const researchROI = this.calculateResearchROI(input);
    const overallScore = this.calculateOverallScore({
      trustScore,
      sustainabilityRating,
      conservationROI,
      communityROI,
      researchROI
    });
    const riskLevel = this.calculateRiskLevel(input);
    const recommendationStrength = this.calculateRecommendationStrength(input, overallScore);

    return {
      trustScore,
      sustainabilityRating,
      conservationROI,
      communityROI,
      researchROI,
      overallScore,
      riskLevel,
      recommendationStrength
    };
  }

  /**
   * Trust Score (1-10): Based on reviews, certifications, audit results
   */
  private static calculateTrustScore(input: AnalyticsInput): number {
    let score = 0;
    
    // Review component (40% weight)
    const reviewScore = Math.min(input.reviews.averageRating * 2, 10); // Scale 5-star to 10
    const reviewVolumeBonus = Math.min(input.reviews.totalReviews / 100, 1); // Bonus for volume
    const verifiedReviewsRatio = input.reviews.recentReviews.filter(r => r.verified).length / 
                                Math.max(input.reviews.recentReviews.length, 1);
    score += (reviewScore * 0.4) * (1 + reviewVolumeBonus * 0.2) * (1 + verifiedReviewsRatio * 0.1);

    // Certification component (30% weight)
    const certificationScore = Math.min(input.certifications.length * 2, 10);
    const premiumCerts = input.certifications.filter(cert => 
      ['Green Globe', 'Rainforest Alliance', 'B Corp', 'LEED', 'Carbon Neutral'].includes(cert)
    ).length;
    score += (certificationScore * 0.3) * (1 + premiumCerts * 0.1);

    // Audit component (20% weight)
    const auditScore = (input.verification.auditScore / 100) * 10;
    const auditRecency = this.getAuditRecencyMultiplier(input.verification.lastAuditDate);
    const complianceDeduction = Math.min(input.verification.complianceIssues * 0.5, 2);
    score += (auditScore * auditRecency * 0.2) - complianceDeduction;

    // Longevity component (10% weight)
    const longevityScore = Math.min(input.operations.yearsInOperation / 10, 1) * 10;
    score += longevityScore * 0.1;

    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }

  /**
   * Sustainability Rating (1-5): Environmental and social impact
   */
  private static calculateSustainabilityRating(input: AnalyticsInput): number {
    let score = 0;

    // Conservation spending ratio (40% weight)
    const conservationRatio = input.financials.conservationSpending / input.financials.annualRevenue;
    score += Math.min(conservationRatio * 20, 2); // Max 2 points for 10%+ spending

    // Local employment (25% weight)
    const localEmploymentScore = (input.operations.localStaffPercentage / 100) * 1.25;
    score += localEmploymentScore;

    // Community impact (20% weight)
    const communityRatio = input.financials.communitySpending / input.financials.annualRevenue;
    score += Math.min(communityRatio * 20, 1); // Max 1 point for 5%+ spending

    // Species protection (15% weight)
    const speciesScore = Math.min(input.conservationImpact.speciesProtected.length * 0.15, 0.75);
    score += speciesScore;

    return Math.max(1, Math.min(5, Math.round(score * 2) / 2)); // Round to nearest 0.5
  }

  /**
   * Conservation ROI: Conservation impact per dollar spent
   */
  private static calculateConservationROI(input: AnalyticsInput): number {
    if (input.financials.conservationSpending === 0) return 0;
    
    const impactScore = (
      input.conservationImpact.projectsSupported * 1000 + // $1000 value per project
      input.conservationImpact.speciesProtected.length * 5000 + // $5000 value per species
      input.conservationImpact.fundsRaised * 0.1 // 10% attribution to supplier
    );
    
    return Math.round((impactScore / input.financials.conservationSpending) * 10) / 10;
  }

  /**
   * Community ROI: Community benefit per dollar spent
   */
  private static calculateCommunityROI(input: AnalyticsInput): number {
    if (input.financials.communitySpending === 0) return 0;
    
    const communityScore = (
      input.operations.localStaffPercentage * input.operations.capacity * 100 + // Local employment value
      input.conservationImpact.fundsRaised * 0.05 // 5% community attribution
    );
    
    return Math.round((communityScore / input.financials.communitySpending) * 10) / 10;
  }

  /**
   * Research ROI: Research value per dollar spent
   */
  private static calculateResearchROI(input: AnalyticsInput): number {
    if (input.financials.researchSpending === 0) return 0;
    
    const researchScore = (
      input.conservationImpact.projectsSupported * 2000 + // $2000 research value per project
      input.conservationImpact.speciesProtected.length * 3000 // $3000 research value per species
    );
    
    return Math.round((researchScore / input.financials.researchSpending) * 10) / 10;
  }

  /**
   * Overall Score: Weighted combination of all metrics
   */
  private static calculateOverallScore(metrics: {
    trustScore: number;
    sustainabilityRating: number;
    conservationROI: number;
    communityROI: number;
    researchROI: number;
  }): number {
    const normalizedSustainability = (metrics.sustainabilityRating / 5) * 10; // Scale to 10
    const normalizedConservationROI = Math.min(metrics.conservationROI / 10, 10); // Cap at 10
    const normalizedCommunityROI = Math.min(metrics.communityROI / 10, 10);
    const normalizedResearchROI = Math.min(metrics.researchROI / 10, 10);

    const weightedScore = (
      metrics.trustScore * 0.3 +
      normalizedSustainability * 0.25 +
      normalizedConservationROI * 0.2 +
      normalizedCommunityROI * 0.15 +
      normalizedResearchROI * 0.1
    );

    return Math.round(weightedScore * 10) / 10;
  }

  /**
   * Risk Level: Based on compliance, audit results, and operational factors
   */
  private static calculateRiskLevel(input: AnalyticsInput): 'low' | 'medium' | 'high' {
    let riskPoints = 0;

    // Compliance issues
    riskPoints += input.verification.complianceIssues * 2;

    // Audit score
    if (input.verification.auditScore < 70) riskPoints += 3;
    else if (input.verification.auditScore < 85) riskPoints += 1;

    // Audit recency
    const auditAge = this.getAuditAgeInMonths(input.verification.lastAuditDate);
    if (auditAge > 24) riskPoints += 3;
    else if (auditAge > 12) riskPoints += 1;

    // Low review volume
    if (input.reviews.totalReviews < 10) riskPoints += 2;

    // New operation
    if (input.operations.yearsInOperation < 2) riskPoints += 2;

    if (riskPoints >= 6) return 'high';
    if (riskPoints >= 3) return 'medium';
    return 'low';
  }

  /**
   * Recommendation Strength: How strongly to recommend this supplier
   */
  private static calculateRecommendationStrength(input: AnalyticsInput, overallScore: number): number {
    let strength = overallScore / 10; // Base on overall score

    // Boost for high-impact suppliers
    if (input.conservationImpact.projectsSupported > 10) strength += 0.1;
    if (input.conservationImpact.speciesProtected.length > 5) strength += 0.1;

    // Reduce for high-risk suppliers
    const riskLevel = this.calculateRiskLevel(input);
    if (riskLevel === 'high') strength -= 0.3;
    else if (riskLevel === 'medium') strength -= 0.1;

    // Boost for premium certifications
    const premiumCerts = input.certifications.filter(cert => 
      ['Green Globe', 'Rainforest Alliance', 'B Corp'].includes(cert)
    ).length;
    strength += premiumCerts * 0.05;

    return Math.max(0, Math.min(1, Math.round(strength * 100) / 100));
  }

  /**
   * Helper: Get audit recency multiplier
   */
  private static getAuditRecencyMultiplier(auditDate: string): number {
    const ageInMonths = this.getAuditAgeInMonths(auditDate);
    if (ageInMonths <= 6) return 1.0;
    if (ageInMonths <= 12) return 0.9;
    if (ageInMonths <= 24) return 0.7;
    return 0.5;
  }

  /**
   * Helper: Get audit age in months
   */
  private static getAuditAgeInMonths(auditDate: string): number {
    const audit = new Date(auditDate);
    const now = new Date();
    return (now.getTime() - audit.getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  /**
   * Batch process multiple suppliers
   */
  static batchCalculateMetrics(inputs: AnalyticsInput[]): Map<string, SupplierMetrics> {
    const results = new Map<string, SupplierMetrics>();
    
    for (const input of inputs) {
      const metrics = this.calculateSupplierMetrics(input);
      results.set(input.supplierId, metrics);
    }
    
    return results;
  }

  /**
   * Calculate market position relative to other suppliers
   */
  static calculateMarketPosition(
    supplierId: string, 
    allMetrics: Map<string, SupplierMetrics>
  ): {
    trustRank: number;
    sustainabilityRank: number;
    overallRank: number;
    percentile: number;
  } {
    const supplierMetrics = allMetrics.get(supplierId);
    if (!supplierMetrics) throw new Error('Supplier not found');

    const allSuppliers = Array.from(allMetrics.values());
    
    const trustRank = allSuppliers.filter(s => s.trustScore > supplierMetrics.trustScore).length + 1;
    const sustainabilityRank = allSuppliers.filter(s => s.sustainabilityRating > supplierMetrics.sustainabilityRating).length + 1;
    const overallRank = allSuppliers.filter(s => s.overallScore > supplierMetrics.overallScore).length + 1;
    
    const percentile = Math.round(((allSuppliers.length - overallRank + 1) / allSuppliers.length) * 100);

    return {
      trustRank,
      sustainabilityRank,
      overallRank,
      percentile
    };
  }
}

// Export for Firebase Functions
export const analyticsEngine = AnalyticsEngine;
