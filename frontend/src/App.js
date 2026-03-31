import React, { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect, { getDashboardPath } from "./components/RoleRedirect";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import ClubDashboard from "./pages/ClubDashboard";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import ClubsPage from "./pages/ClubsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ClubRecruitmentPage from "./pages/ClubRecruitmentPage";
import VolunteerPage from "./pages/VolunteerPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const handleLogin = (loggedInUser, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    navigate(getDashboardPath(loggedInUser.role));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<RoleRedirect user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<RoleRedirect user={user} />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/about"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard section="about" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/events"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard section="create-events" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/view-events"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard section="view-events" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/certificates"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard section="certificates" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/volunteers"
            element={
              <ProtectedRoute user={user} allowedRoles={["department_coordinator"]}>
                <DepartmentDashboard section="volunteers" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/about"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="about" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/events"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="create-events" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/view-events"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="view-events" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/recruitments"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="create-recruitments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/view-recruitments"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="view-recruitments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/volunteers"
            element={
              <ProtectedRoute user={user} allowedRoles={["club_coordinator"]}>
                <ClubDashboard section="volunteers" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute user={user} allowedRoles={["student", "admin"]}>
                <EventsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute user={user} allowedRoles={["student", "admin"]}>
                <EventDetailsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs"
            element={
              <ProtectedRoute user={user} allowedRoles={["student", "department_coordinator", "club_coordinator", "admin"]}>
                <ClubsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute user={user} allowedRoles={["student", "department_coordinator", "club_coordinator", "admin"]}>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruitment"
            element={
              <ProtectedRoute user={user} allowedRoles={["student"]}>
                <ClubRecruitmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute user={user} allowedRoles={["student"]}>
                <VolunteerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} allowedRoles={["student", "department_coordinator", "club_coordinator", "admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
