import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function StudentDashboard() {
  const [dashboard, setDashboard] = useState({
    upcomingEvents: [],
    volunteerAssignments: [],
    recruitmentApplications: [],
    certificates: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/user/dashboard");
        setDashboard(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <section>
      <div className="hero-banner student-hero">
        <div>
          <p className="hero-tag">Welcome Student</p>
          <h1>Campus opportunities, volunteering, and your activity record are all waiting here.</h1>
          <p className="hero-copy">
            Use the navigation bar to explore events, apply for volunteering, view clubs and departments, and manage your campus journey.
          </p>
        </div>
        <div className="hero-chip-stack">
          <span className="hero-chip">Events: {dashboard.upcomingEvents.length}</span>
          <span className="hero-chip">Certificates: {dashboard.certificates.length}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Registered Events</p>
          <h2>{dashboard.upcomingEvents.length}</h2>
        </div>
        <div className="stat-card">
          <p>Volunteer Roles</p>
          <h2>{dashboard.volunteerAssignments.length}</h2>
        </div>
        <div className="stat-card">
          <p>Applications</p>
          <h2>{dashboard.recruitmentApplications.length}</h2>
        </div>
        <div className="stat-card">
          <p>Certificates</p>
          <h2>{dashboard.certificates.length}</h2>
        </div>
      </div>

      <div className="dashboard-home-grid">
        <div className="card spotlight-card interactive-card">
          <p className="panel-tag">Next Step</p>
          <h2>Explore what is happening on campus this week.</h2>
          <p>Find events with open seats, volunteer opportunities, and participation records connected to your account.</p>
          <div className="quick-link-grid">
            <Link className="action-tile" to="/events">
              <strong>Browse Events</strong>
              <span>Open the campus event board</span>
            </Link>
            <Link className="action-tile" to="/volunteer">
              <strong>Volunteer</strong>
              <span>Apply for active volunteer roles</span>
            </Link>
            <Link className="action-tile" to="/clubs">
              <strong>Club Directory</strong>
              <span>See student clubs and their stories</span>
            </Link>
            <Link className="action-tile" to="/departments">
              <strong>Departments</strong>
              <span>View department information and events</span>
            </Link>
          </div>
        </div>

        <div className="card interactive-card">
          <p className="panel-tag">Recent Activity</p>
          <h2>Your Latest Registrations</h2>
          <div className="dashboard-list">
            {dashboard.upcomingEvents.slice(0, 3).map((event) => (
              <div className="list-row" key={event.id}>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.venue}</p>
                </div>
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
            ))}
            {!dashboard.upcomingEvents.length && <p>No registrations yet. Start by exploring campus events.</p>}
          </div>
        </div>

        <div className="card interactive-card">
          <p className="panel-tag">Participation</p>
          <h2>Certificates and Progress</h2>
          <p>Your QR registrations, volunteer approvals, and certificates stay tied to your account history.</p>
          <div className="metric-ribbon">
            <span>{dashboard.certificates.length} certificates</span>
            <span>{dashboard.volunteerAssignments.length} volunteer updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentDashboard;
