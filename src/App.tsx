import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ComplianceControls from "./pages/ComplianceControls";
import RiskQuantification from "./pages/RiskQuantification";
import MaturityAssessment from "./pages/MaturityAssessment";
import ThreatScenarios from "./pages/ThreatScenarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/compliance" element={<ComplianceControls />} />
          <Route path="/risk" element={<RiskQuantification />} />
          <Route path="/maturity" element={<MaturityAssessment />} />
          <Route path="/threats" element={<ThreatScenarios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
