import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Opportunities from "./Pages/Opportunities";
import OpportunityDetail from "./Pages/OpportunityDetail";
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import SavedOpportunities from "./Pages/SavedOpportunities";
import Feedback from "./Pages/Feedback";
import Subscriptions from "./Pages/Subscriptions";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsAndConditions from "./Pages/TermsAndConditions";

import AdminDashboard from "./Pages/admin/Dashboard";
import AdminOpportunities from "./Pages/admin/Opportunities";
import OpportunityForm from "./Pages/admin/OpportunityForm";
import VerificationQueue from "./Pages/admin/VerificationQueue";
import AdminSources from "./Pages/admin/Sources";
import AdminUsers from "./Pages/admin/users";
import AdminFeedback from "./Pages/admin/Feedback";
import AdminReports from "./Pages/admin/Reports";
import VerifyEmail from "./Pages/VerifyEmail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedOpportunities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="opportunities" element={<AdminOpportunities />} />
                <Route path="verification" element={<VerificationQueue />} />
                <Route path="sources" element={<AdminSources />} />
                <Route
                  path="opportunities/create"
                  element={<OpportunityForm />}
                />
                <Route
                  path="opportunities/edit/:id"
                  element={<OpportunityForm />}
                />
                <Route path="users" element={<AdminUsers />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
