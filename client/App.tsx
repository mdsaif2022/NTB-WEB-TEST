import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./lib/firebaseTest"; // Test Firebase connection on startup
import { UserProvider } from "./contexts/UserContext";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { FirebaseNotificationProvider } from "./contexts/FirebaseNotificationContext";
import { TourProvider } from "./contexts/TourContext";
import { BlogProvider } from "./contexts/BlogContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BookingProvider } from "./contexts/BookingContext";
import Index from "./pages/Index";
import Tours from "./pages/Tours";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import PasswordlessLogin from "./pages/auth/PasswordlessLogin";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Booking from "./pages/Booking";
import BlogSubmission from "./pages/BlogSubmission";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TourManagementWrapper from "./pages/admin/TourManagementWrapper";
import BlogManagementWrapper from "./pages/admin/BlogManagementWrapper";
import AdminSettings from "./pages/admin/AdminSettings";
import NewTour from "./pages/admin/NewTour";
import NotificationManagement from "./pages/admin/NotificationManagement";
import NotFound from "./pages/NotFound";
import BookingManagement from "./pages/admin/BookingManagement";
import { HelmetProvider } from 'react-helmet-async';
import AdminLogin from "./pages/admin/AdminLogin";
import ScrollToTop from "./components/ScrollToTop";
import DemoModeBanner from "./components/DemoModeBanner";
import { isDemoConfig } from "./lib/firebaseConfig";
import FirebaseTest from "./components/FirebaseTest";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <FirebaseAuthProvider>
              <UserProvider>
                <NotificationProvider>
                  <FirebaseNotificationProvider>
                    <BookingProvider>
                      <TourProvider>
                        <BlogProvider>
                          <TooltipProvider>
                            <Toaster />
                            <Sonner />
                            <BrowserRouter>
                            <ScrollToTop />
                            <DemoModeBanner isVisible={isDemoConfig && !sessionStorage.getItem('hideDemoBanner')} />
                            <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/tours" element={<Tours />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/auth" element={<Auth />} />
                            <Route path="/auth/register" element={<Register />} />
                            <Route path="/auth/login" element={<Login />} />
                            <Route path="/auth/passwordless-login" element={<PasswordlessLogin />} />
                            <Route path="/auth/verify-email" element={<VerifyEmail />} />
                            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin-login" element={<AdminLogin />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/blog/submit" element={<BlogSubmission />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/firebase-test" element={<FirebaseTest />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="users" element={<UserManagement />} />
                          <Route path="tours" element={<TourManagementWrapper />} />
                          <Route path="tours/new" element={<NewTour />} />
                          <Route path="blogs" element={<BlogManagementWrapper />} />
                          <Route path="notifications" element={<NotificationManagement />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="bookings" element={<BookingManagement />} />
                        </Route>

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                            </Routes>
                          </BrowserRouter>
                          </TooltipProvider>
                        </BlogProvider>
                      </TourProvider>
                    </BookingProvider>
                  </FirebaseNotificationProvider>
                </NotificationProvider>
              </UserProvider>
            </FirebaseAuthProvider>
          </SettingsProvider>
        </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
