import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider, useNotifications } from './components/social/NotificationsComponent';

// Import your page components
import DashboardHome from "./pages/admin/DashboardHome";
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/ContactMessages';
import MentorReportForm from './pages/Report';
import PartnerForm from'./pages/admin/Partners'
import DonationForm from'./pages/admin/Donations'
import Mentorship from'./pages/admin/Mentorship'
import AdminFormManager from './pages/admin/AdminFormManager'
import SubmissionViewer from './pages/admin/SubmissionViewer'
import PublicForm from './pages/admin/PublicForm'


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
import PostPage from './pages/PostPage';
import Contact from './pages/Contact';
import ChatApp from './pages/chatApp';
import PrivateSettings from './pages/Settings';
import ElementalProjects from './pages/ElementalProjects';
import CommunityPage from './pages/CommunityPage';
import ProtectedRoute from './components/ProtectedRoute';
import Team from './pages/Team';
import NewsletterPage from './pages/NewsletterPage';
import ArtSkillsPage from './pages/ArtSkillsPage';
import Staff from './pages/admin/Staff';  
import ContactMessages from './pages/admin/ContactMessages'; // Import the new ContactMessages page


const queryClient = new QueryClient();

// Define your custom hook for page tracking
const usePageTracking = () => {
  const location = useLocation(); // Get the current location object from react-router-dom

  useEffect(() => {
    // Check if gtag is available globally (from the script in index.html)
    if (window.gtag) {
      // Send a 'page_view' event to Google Analytics
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search, // The path of the page (e.g., /dashboard/reports?param=value)
        page_location: window.location.href, // The full URL of the page
        page_title: document.title // The title of the HTML document (can be set dynamically per page if desired)
      });
      console.log(`GA4 page_view event sent for: ${location.pathname}`);
    } else {
      console.warn('Google Analytics gtag not found. Make sure it is loaded in public/index.html');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [location]); // This effect re-runs every time the 'location' object changes (i.e., route changes)
};

// New component to wrap the usePageTracking hook
const GATracker = () => {
  usePageTracking(); // Call the hook inside this component
  return null; // This component doesn't render any UI
};

// Component to render the shared notifications modal
const NotificationsModalContainer = () => {
  const { NotificationsModal } = useNotifications();
  return <NotificationsModal />;
};

const App = () => {
  return (
    <AuthProvider>
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <NotificationsProvider>
                {/* Render the GATracker component inside BrowserRouter */}
                <GATracker /> 
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/accessibility" element={<AccessibilityStatement />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/forgotPassword" element={<ForgotPassword />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<LogIn />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/projects" element={<ElementalProjects />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/newsletter" element={<NewsletterPage />} />
                  <Route path="/artSkills" element={<ArtSkillsPage />} />

                  {/* Protected Pages */}
                  <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/post/:postId" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                  <Route path="/chat/:chatId" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                  <Route path="/chat/inquiry/:inquiryId" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                  <Route path="/chat/inquiry" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><PrivateSettings /></ProtectedRoute>} />

                  {/* Mentor Report Form */}
                  <Route path="/report" element={<MentorReportForm />} />

                  {/* Admin Pages */}
                  <Route path="/admin" element={<DashboardHome />} />
                  <Route path="/admin/Users" element={<Users />} />
                  <Route path="/admin/Partners" element={<PartnerForm />} />
                  <Route path="/admin/Reports" element={<Reports />} />
                  <Route path="/admin/Settings" element={<Settings />} />
                  <Route path="/admin/donations" element={<DonationForm/>} />
                  <Route path="/admin/Mentorship" element={<Mentorship/>} />
                  <Route path="/admin/forms" element={<AdminFormManager />} />
                  <Route path="/admin/submissions" element={<SubmissionViewer />} />
                  <Route path="/form/:formId" element={<PublicForm />} />
                  <Route path="/admin/staff" element={<Staff />} />
                  <Route path="/admin/contactMessages" element={<ContactMessages />} />


                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {/* Render the shared notifications modal */}
                <NotificationsModalContainer />
              </NotificationsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </React.StrictMode>
    </AuthProvider>
  );
};

export default App;
