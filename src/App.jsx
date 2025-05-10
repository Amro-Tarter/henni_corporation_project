import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AccessibilityStatement from './pages/AccessibilityStatement';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import LogIn from './pages/logIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/forgotPassword';
import Home from './pages/Home';
import ProfilePage from './pages/profilePage';
import Contact from './pages/Contact';
import ChatApp from './pages/chatApp';
import ElementalProjects from './pages/ElementalProjects';
import PublicSettings from './pages/PublicSettings';
import CommunityPage from './pages/CommunityPage';
// import TeamPage from './pages/TeamPage';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/community" element={<CommunityPage />} />

            {/* Protected Pages */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ElementalProjects /></ProtectedRoute>} />
            <Route path="/public-settings" element={<ProtectedRoute><PublicSettings /></ProtectedRoute>} />
            {/* <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} /> */}

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
