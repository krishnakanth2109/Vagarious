import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Employers from "./pages/Employers";
import Candidates from "./pages/Candidates";
import Contact from "./pages/Contact";
import Contract from "./pages/Contract";
import NotFound from "./pages/NotFound";
import ITRecruitment from "./pages/ITRecruitment";
import NonITRecruitment from "./pages/NonITRecruitment";
import StaffingModels from "./pages/StaffingModels";

// Utilities
<<<<<<< HEAD
import ScrollToTop from "./components/ScrollToTop";
import { Chatbot } from "./components/Chatbot";
=======


// Components
import Chatbot from "./components/Chatbot"; // <--- 1. IMPORT CHATBOT
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659

// Admin Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminJobs from "./pages/admin/AdminJobs";
<<<<<<< HEAD
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminITRecruitment from "./pages/admin/AdminITRecruitment";
import AdminEmployerRequirements from "./pages/admin/AdminEmployerRequirements";
import AdminNonITRoles from "./pages/admin/AdminNonITRoles"; // <--- IMPORT THIS
=======
import AdminCandidates from "./pages/admin/AdminCandidates"; 
import AdminITRecruitment from "./pages/admin/AdminITRecruitment"; 
import AdminEmployerRequirements from "./pages/admin/AdminEmployerRequirements"; 
import AdminNonITRoles from "./pages/admin/AdminNonITRoles";
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Ensures page scrolls to top on route change */}
<<<<<<< HEAD
        <ScrollToTop />
        <Chatbot />

=======
       
        
        {/* Chatbot appears on all pages */}
        <Chatbot />  {/* <--- 2. ADD COMPONENT HERE */}
        
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/employers" element={<Employers />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ITRecruitment" element={<ITRecruitment />} />
          <Route path="/NonITRecruitment" element={<NonITRecruitment />} />
          <Route path="/StaffingModels" element={<StaffingModels />} />

          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-jobs" element={<AdminJobs />} />
          <Route path="/admin-candidates" element={<AdminCandidates />} />
          <Route path="/admin-it-recruitment" element={<AdminITRecruitment />} />
<<<<<<< HEAD

          {/* NEW NON-IT ROUTE */}
=======
          
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
          <Route path="/admin-non-it-roles" element={<AdminNonITRoles />} />
          <Route path="/admin-requirements" element={<AdminEmployerRequirements />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;