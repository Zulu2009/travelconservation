import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import Directory from './pages/Directory/Directory';
import PersonaPlanner from './pages/PersonaPlanner/PersonaPlanner';
import NerdMode from './pages/NerdMode/NerdMode';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';

import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import AuthProvider from './components/auth/AuthProvider';
import SeedButton from './components/Admin/SeedButton';
import GeminiTest from './components/Debug/GeminiTest';
import SimpleGeminiTest from './components/Debug/SimpleGeminiTest';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/persona-planner" element={<PersonaPlanner />} />
                <Route path="/nerd-mode" element={<NerdMode />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/debug/gemini" element={<GeminiTest />} />
                <Route path="/debug/simple" element={<SimpleGeminiTest />} />
              </Routes>
              {process.env.NODE_ENV === 'development' && <SeedButton />}
            </Layout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
