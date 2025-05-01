import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { reportWebVitals, preloadComponents } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";

// Lazy load pages
const Index = React.lazy(() => import("./pages/Index"));
const Success = React.lazy(() => import("./pages/Success"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Models = React.lazy(() => import("./pages/Models"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-tech-dark flex items-center justify-center">
    <div className="animate-pulse text-tech-blue">Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const location = useLocation();
  useVisitorTracking(); // Track visits on protected routes too

  if (!isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  useVisitorTracking(); // Track visits on all routes

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/success" element={<Success />} />
        <Route path="/models" element={<Models />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
