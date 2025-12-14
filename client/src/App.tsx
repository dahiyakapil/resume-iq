// import { useEffect } from "react";
// import { Routes, Route } from "react-router-dom";
// import { ThemeProvider } from "./components/contexts/ThemeContext";
// import { Toaster } from "sonner";
// import { HomePage } from "./pages/HomePage";
// import SignupPage from "./pages/SignupPage";
// import VerifyOtpPage from "./pages/VerifyOtpPage";
// import LoginPage from "./pages/loginPage";
// import { ProtectedRoute } from "./components/ProtectedRoute";
// import DashboardLayout from "./pages/DashboardLayout";
// import Dashboard from "./pages/Dashboard";
// import HistoryPage from "./pages/HistoryPage";
// import { RewriteBulletPointsPage } from "./pages/RewriteBulletPointsPage";
// import SettingsPage from "./pages/SettingsPage";
// import JobMatch from "./pages/JobMatch";
// import { fetchCurrentUser } from "./app/features/authSlice";
// import { useAppDispatch } from "./hooks/redux";

// function App() {

//   const dispatch = useAppDispatch();
  

//   useEffect(() => {
//     dispatch(fetchCurrentUser());
//   }, [dispatch]);

  


//   return (
//     <ThemeProvider>
//       <Toaster richColors position="bottom-right" />

//       {/* Pass only the scroll handler */}

//       <Routes>
        
//         <Route path="/" element={<HomePage />} />
//         <Route path="/signup" element={<SignupPage />} />
//         <Route path="/verify-otp" element={<VerifyOtpPage />} />
//         <Route path="/login" element={<LoginPage />} />

//         {/* Protected Routes */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <DashboardLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="history" element={<HistoryPage />} />
//           <Route
//             path="rewrite-suggestion"
//             element={<RewriteBulletPointsPage />}
//           />
//           <Route path="settings" element={<SettingsPage />} />
//           <Route path="job-match" element={<JobMatch />} />
//         </Route>
//       </Routes>
//     </ThemeProvider>
//   );
// }

// export default App;





import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/contexts/ThemeContext";
import { Toaster } from "sonner";
import { HomePage } from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import LoginPage from "./pages/loginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import { RewriteBulletPointsPage } from "./pages/RewriteBulletPointsPage";
import SettingsPage from "./pages/SettingsPage";
import JobMatch from "./pages/JobMatch";
import { fetchCurrentUser } from "./app/features/authSlice";
import { useAppDispatch } from "./hooks/redux";

// ✅ Import Admin Layout & Pages
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Users } from "./pages/admin/Users";
import { Reports } from "./pages/admin/Reports";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminSettings } from "./pages/admin/AdminSettings";



function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <ThemeProvider>
      <Toaster richColors position="bottom-right" />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* User Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="rewrite-suggestion" element={<RewriteBulletPointsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="job-match" element={<JobMatch />} />
        </Route>

        {/* ✅ Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
