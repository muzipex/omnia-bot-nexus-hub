
import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { reportWebVitals, preloadComponents } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import DotLoader from "@/components/DotLoader";

// Lazy load pages
const Index = React.lazy(() => import("./pages/Index"));
const Success = React.lazy(() => import("./pages/Success"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Models = React.lazy(() => import("./pages/Models"));
const Admin = React.lazy(() => import("./pages/Admin"));

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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<DotLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/success" element={<Success />} />
                <Route path="/models" element={<Models />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
