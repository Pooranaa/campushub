import React, { useEffect, useState } from "react";
import api from "../services/api";

function StudentDashboard() {
  const [dashboard, setDashboard] = useState({
    studentName: "",
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

  const getStatusLabelClass = (status) => {
    if (status === "accepted") return "status-badge status-accepted";
    if (status === "rejected") return "status-badge status-rejected";
    return "status-badge status-pending";
  };

  return (
    <section>
      <div className="hero-banner student-hero">
        <div>
          
          <h1>{dashboard.studentName ? `Welcome, ${dashboard.studentName}!` : "Welcome Student"}</h1>
          
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

      <div className="student-top-grid">
        <div className="card interactive-card student-events-card student-section-card">
          <p className="panel-tag">Registered Events</p>
          <h2>Your Registered Events</h2>
          <div className="dashboard-list">
            {dashboard.upcomingEvents.slice(0, 3).map((event) => (
              <div className="list-row qr-list-row" key={event.id}>
                <div className="registration-copy">
                  <h3>{event.title}</h3>
                  <p>{event.venue}</p>
                  <p className="muted-text">{new Date(event.event_date).toLocaleString()}</p>
                </div>
                {event.qr_code ? (
                  <div className="dashboard-qr-panel">
                    <span className="mini-label">Entry QR</span>
                    <img className="dashboard-qr" src={event.qr_code} alt={`QR for ${event.title}`} />
                  </div>
                ) : (
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                )}
              </div>
            ))}
            {!dashboard.upcomingEvents.length && <p>No registrations yet. Start by exploring campus events.</p>}
          </div>
        </div>

        <div className="card interactive-card student-section-card">
          <p className="panel-tag">Certificates</p>
          <h2>Your Issued Certificates</h2>
          <div className="certificate-grid">
            {dashboard.certificates.map((certificate) => (
              <div className="certificate-preview" key={certificate.id}>
                <div className="certificate-border">
                  <p className="certificate-kicker">CampusHub Certificate</p>
                  <h3>{certificate.certificate_name}</h3>
                  <p>This certifies that <strong>{dashboard.studentName || "the student"}</strong> participated in <strong>{certificate.event_title}</strong>.</p>
                  <p className="muted-text">Issued on {new Date(certificate.issued_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          {!dashboard.certificates.length && <p>No certificates have been issued yet.</p>}
        </div>
      </div>

      <div className="student-bottom-grid student-updates-grid">
        <section className="card interactive-card student-section-card">
          <p className="panel-tag">Recruitment Updates</p>
          <h2>Your Club Applications</h2>
          <div className="dashboard-list">
            {dashboard.recruitmentApplications.map((application) => (
              <div className="list-row application-row" key={application.id}>
                <div>
                  <h3>{application.title}</h3>
                  <p className="muted-text">Your club recruitment decision appears here.</p>
                </div>
                <div>
                  <span className={getStatusLabelClass(application.status)}>
                    {application.status}
                  </span>
                </div>
              </div>
            ))}
            {!dashboard.recruitmentApplications.length && <p>You have not applied for any recruitments yet.</p>}
          </div>
        </section>

        <section className="card interactive-card student-section-card">
          <p className="panel-tag">Volunteering</p>
          <h2>Volunteering Details</h2>
          <div className="dashboard-list">
            {dashboard.volunteerAssignments.map((assignment) => (
              <div className="list-row application-row" key={assignment.id}>
                <div>
                  <h3>{assignment.title}</h3>
                  <p className="muted-text">Assigned role: {assignment.assigned_role || "Volunteer"}</p>
                </div>
                <div>
                  <span className={getStatusLabelClass(assignment.status === "assigned" ? "accepted" : assignment.status)}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {!dashboard.volunteerAssignments.length && <p>No volunteer updates yet.</p>}
        </section>
      </div>
    </section>
  );
}

export default StudentDashboard;
