import React from "react";
import { Link } from "react-router-dom";
import { getDashboardPath } from "./RoleRedirect";

function Navbar({ user, onLogout }) {
  const dashboardPath = user ? getDashboardPath(user.role) : "/login";
  const isDepartmentCoordinator = user?.role === "department_coordinator";
  const isClubCoordinator = user?.role === "club_coordinator";
  const isStudent = user?.role === "student";

  return (
    <nav className="navbar">
      <Link className="brand" to={user ? dashboardPath : "/login"}>
        CampusHub
      </Link>

      <div className="nav-links">
        {!user && <Link className="nav-button" to="/login">Login</Link>}
        {!user && <Link className="nav-button" to="/register">Register</Link>}
        {isStudent && <Link className="nav-button" to={dashboardPath}>Dashboard</Link>}

        {isDepartmentCoordinator && (
          <>
            <Link className="nav-button" to="/department/about">About Department</Link>
            <Link className="nav-button" to="/department/events">Create Events</Link>
            <Link className="nav-button" to="/department/view-events">View Events</Link>
            <Link className="nav-button" to="/department/certificates">Issue Certificates</Link>
            <Link className="nav-button" to="/department/volunteers">Manage Volunteers</Link>
          </>
        )}

        {isClubCoordinator && (
          <>
            <Link className="nav-button" to="/club/about">About Club</Link>
            <Link className="nav-button" to="/club/events">Create Events</Link>
            <Link className="nav-button" to="/club/view-events">View Events</Link>
            <Link className="nav-button" to="/club/recruitments">Create Recruitments</Link>
            <Link className="nav-button" to="/club/view-recruitments">View Recruitments</Link>
            <Link className="nav-button" to="/club/volunteers">Manage Volunteers</Link>
          </>
        )}

        {isStudent && <Link className="nav-button" to="/events">Events</Link>}
        {isStudent && <Link className="nav-button" to="/clubs">Clubs</Link>}
        {isStudent && <Link className="nav-button" to="/departments">Departments</Link>}
        {isStudent && <Link className="nav-button" to="/recruitment">Recruitments</Link>}
        {isStudent && (
          <Link className="nav-button" to="/volunteer">Volunteer</Link>
        )}
        {isStudent && <Link className="nav-button" to="/profile">Profile</Link>}
        {user && <button onClick={onLogout}>Logout</button>}
      </div>
    </nav>
  );
}

export default Navbar;
