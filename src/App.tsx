import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { reportWebVitals, preloadComponents } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import DotLoader from "@/components/DotLoader";
import FallingCandlesAnimation from "@/components/FallingCandlesAnimation";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";

// Import pages directly to avoid dynamic import issues
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import Models from "@/pages/Models";
import Admin from "@/pages/Admin";
import Success from "@/pages/Success";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    reportWebVitals();
    preloadComponents();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <FallingCandlesAnimation />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/models" element={<Models />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;