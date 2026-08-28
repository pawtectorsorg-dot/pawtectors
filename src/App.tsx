import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Clinics from "./pages/Clinics";
import ClinicDashboard from "./pages/ClinicDashboard";
import ClinicAdminDashboard from "./pages/ClinicAdminDashboard";
import PetParentDashboard from "./pages/PetParentDashboard";
import UserLogin from "./pages/UserLogin";
import ClinicLogin from "./pages/ClinicLogin";
import AdminRoleSelect from "./pages/AdminRoleSelect";
import SystemAdminLogin from "./pages/SystemAdminLogin";
import ProviderAdminSelect from "./pages/ProviderAdminSelect";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LocationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/dashboard" element={<PetParentDashboard />} />
                    <Route path="/clinics" element={<Clinics />} />
                    
                    {/* Admin & Clinic Portals */}
                    <Route path="/admin" element={<AdminRoleSelect />} />
                    <Route path="/admin/login" element={<AdminRoleSelect />} />
                    <Route path="/clinic/login" element={<ClinicLogin />} />
                    <Route path="/admin/super" element={<SystemAdminLogin />} />
                    <Route path="/admin/provider" element={<ProviderAdminSelect />} />
                    <Route path="/dashboard/system" element={<SystemAdminDashboard />} />
                    {/* Clinic Admin Dashboard — fully wired to real API */}
                    <Route path="/clinic/dashboard" element={<ClinicAdminDashboard />} />
                    <Route path="/provider/clinic" element={<ClinicDashboard />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </LocationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
