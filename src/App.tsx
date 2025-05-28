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
import ListingDetail from './pages/Directory/ListingDetail';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import AuthProvider from './components/auth/AuthProvider';

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
                <Route path="/directory/:id" element={<ListingDetail />} />
                <Route path="/persona-planner" element={<PersonaPlanner />} />
                <Route path="/nerd-mode" element={<NerdMode />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
