import React from "react";
import { Navigate } from "react-router-dom";

function getDashboardPath(role) {
  if (role === "department_coordinator") return "/department-dashboard";
  if (role === "club_coordinator") return "/club-dashboard";
  return "/student-dashboard";
}

function RoleRedirect({ user }) {
  return <Navigate to={user ? getDashboardPath(user.role) : "/login"} replace />;
}

export { getDashboardPath };
export default RoleRedirect;
