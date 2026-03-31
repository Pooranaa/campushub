import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalEvents: 0,
    activeClubs: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/user/dashboard");
        setDashboard(response.data);
      } catch (error) {
        console.error("Could not fetch admin dashboard", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <section>
      <div className="hero-banner admin-hero">
        <div>
          <p className="hero-tag">Admin Dashboard</p>
          <h1>Oversee activity across the whole campus from a single control center.</h1>
          <p className="hero-copy">
            This dashboard is reserved for system-wide metrics and recent platform activity.
          </p>
        </div>
        <Link className="nav-button" to="/events">
          Review Events
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Students</p>
          <h2>{dashboard.totalStudents}</h2>
        </div>
        <div className="stat-card">
          <p>Total Events</p>
          <h2>{dashboard.totalEvents}</h2>
        </div>
        <div className="stat-card">
          <p>Active Clubs</p>
          <h2>{dashboard.activeClubs}</h2>
        </div>
      </div>

      <section className="card wide-card">
        <h2>Recent Activities</h2>
        <div className="dashboard-list">
          {dashboard.recentActivities.map((item, index) => (
            <div className="list-row" key={index}>
              <div>
                <h3>{item.title}</h3>
                <p>Campus event activity</p>
              </div>
              <span>{new Date(item.event_date).toLocaleDateString()}</span>
            </div>
          ))}
          {!dashboard.recentActivities.length && <p>No recent activities yet.</p>}
        </div>
      </section>
    </section>
  );
}

export default AdminDashboard;
