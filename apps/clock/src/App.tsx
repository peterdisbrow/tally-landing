import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Clock from "./pages/Clock";
import MultiClock from "./pages/MultiClock";
import NotFound from "./pages/NotFound";
import { TallyConnectProvider } from "@/hooks/useTallyConnect";
import { getRouterBasename } from "@/lib/clockBasename";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TallyConnectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={getRouterBasename()}>
          <Routes>
            <Route path="/" element={<Clock />} />
            <Route path="/clock" element={<Clock />} />
            <Route path="/quote" element={<Index />} />
            <Route path="/services" element={<Index />} />
            <Route path="/multi-clock" element={<MultiClock />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TallyConnectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
