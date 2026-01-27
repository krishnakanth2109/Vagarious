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

// Admin Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminCandidates from "./pages/AdminCandidates";
import AdminJobs from "./pages/admin/AdminJobs"; // Import the new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/admin-candidates" element={<AdminCandidates />} />
          
          {/* NEW ROUTE FOR JOB MANAGEMENT */}
          <Route path="/admin-jobs" element={<AdminJobs />} />
     
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;