
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
import SignUp from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import Home from './pages/Home';
import ProfilePage from './pages/profilePage'; 
import Contact from './pages/Contact'; 

// Create a react-query client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/contact" element={<Contact />} />
              {/* New Pages */}
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/signUp" element={<SignUp />} />   
              <Route path="/logIn" element={<LogIn />}/>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
