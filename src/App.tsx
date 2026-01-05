import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import ComplianceControls from "./pages/ComplianceControls";
import RiskQuantification from "./pages/RiskQuantification";
import MaturityAssessment from "./pages/MaturityAssessment";
import ThreatScenarios from "./pages/ThreatScenarios";
import EvidenceSources from "./pages/EvidenceSources";
import AdminDashboard from "./pages/AdminDashboard";
import FrameworkMapping from "./pages/FrameworkMapping";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Remediation from "./pages/Remediation";
import ResearchValidation from "./pages/ResearchValidation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrganizationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute requiresOrganization={false}><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><ComplianceControls /></ProtectedRoute>} />
            <Route path="/risk" element={<ProtectedRoute><RiskQuantification /></ProtectedRoute>} />
            <Route path="/maturity" element={<ProtectedRoute><MaturityAssessment /></ProtectedRoute>} />
            <Route path="/threats" element={<ProtectedRoute><ThreatScenarios /></ProtectedRoute>} />
            <Route path="/evidence" element={<ProtectedRoute><EvidenceSources /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/frameworks" element={<ProtectedRoute><FrameworkMapping /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/remediation" element={<ProtectedRoute><Remediation /></ProtectedRoute>} />
            <Route path="/research" element={<ProtectedRoute><ResearchValidation /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrganizationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
