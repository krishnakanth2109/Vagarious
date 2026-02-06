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


// Components
import Chatbot from "./components/Chatbot"; // <--- 1. IMPORT CHATBOT

// Admin Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCandidates from "./pages/admin/AdminCandidates"; 
import AdminITRecruitment from "./pages/admin/AdminITRecruitment"; 
import AdminEmployerRequirements from "./pages/admin/AdminEmployerRequirements"; 
import AdminNonITRoles from "./pages/admin/AdminNonITRoles";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Ensures page scrolls to top on route change */}
       
        
        {/* Chatbot appears on all pages */}
        <Chatbot />  {/* <--- 2. ADD COMPONENT HERE */}
        
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