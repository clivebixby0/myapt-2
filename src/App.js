import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import Payments from "./pages/payments/Payments";
import Maintenance from "./pages/maintenance/Maintenance";
import Stats from "./pages/stats/Stats";
import Notifications from "./pages/notifications/Notifications";
import System from "./pages/system/System";
import Logs from "./pages/logs/Logs";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userInputs, apartmentInputs, paymentInputs, maintenanceInputs } from "./formSource";
import "./style/dark.scss";
import "./style/colors.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            
            {/* Default route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected dashboard route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />

            {/* Admin only routes */}
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <List />
              </ProtectedRoute>
            } />
            <Route path="/users/:userId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Single />
              </ProtectedRoute>
            } />
            <Route path="/users/new" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <New inputs={userInputs} title="Add New User" />
              </ProtectedRoute>
            } />

            {/* Both admin and tenant routes */}
            <Route path="/apartments" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <List />
              </ProtectedRoute>
            } />
            <Route path="/apartments/:apartmentId" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Single />
              </ProtectedRoute>
            } />
            <Route path="/apartments/new" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <New inputs={apartmentInputs} title="Add New Apartment" />
              </ProtectedRoute>
            } />

            {/* Payment routes */}
            <Route path="/payments" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/payments/new" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <New inputs={paymentInputs} title="Add New Payment" />
              </ProtectedRoute>
            } />

            {/* Maintenance routes */}
            <Route path="/maintenance" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Maintenance />
              </ProtectedRoute>
            } />
            <Route path="/maintenance/new" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <New inputs={maintenanceInputs} title="Add New Maintenance Request" />
              </ProtectedRoute>
            } />

            {/* Additional routes */}
            <Route path="/stats" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Stats />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/system" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <System />
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Logs />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'tenant']}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
