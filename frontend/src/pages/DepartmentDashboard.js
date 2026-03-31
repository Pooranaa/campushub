import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function DepartmentDashboard({ section = "all" }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [dashboard, setDashboard] = useState({
    totalDepartmentEvents: 0,
    totalRegistrations: 0,
    departmentEvents: []
  });
  const [departmentProfile, setDepartmentProfile] = useState({
    description: "",
    about_us: ""
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_type: "workshop",
    venue: "",
    event_date: "",
    registration_deadline: "",
    seat_limit: "",
    volunteer_slots: "",
    poster: null
  });
  const [certificateForm, setCertificateForm] = useState({
    student_id: "",
    event_id: "",
    certificate_name: ""
  });
  const [certificateOptions, setCertificateOptions] = useState({
    events: [],
    studentsByEvent: {}
  });
  const [volunteerRequests, setVolunteerRequests] = useState([]);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const [dashboardResponse, volunteerResponse, departmentResponse, certificateOptionsResponse] = await Promise.all([
        api.get("/user/dashboard"),
        api.get("/volunteer/requests"),
        api.get(`/departments/${user.department_id}`),
        api.get("/certificates/options")
      ]);

      setDashboard(dashboardResponse.data);
      setVolunteerRequests(volunteerResponse.data);
      setDepartmentProfile({
        description: departmentResponse.data.description || "",
        about_us: departmentResponse.data.about_us || ""
      });
      setCertificateOptions({
        events: certificateOptionsResponse.data.events || [],
        studentsByEvent: certificateOptionsResponse.data.studentsByEvent || {}
      });
    } catch (error) {
      console.error("Could not load department dashboard", error);
    }
  };

  useEffect(() => {
    if (user.department_id) {
      loadDashboard();
    }
  }, [user.department_id]);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/departments/${user.department_id}`, {
        description: departmentProfile.description,
        about_us: departmentProfile.about_us,
        faculty: []
      });
      setMessage("Department profile updated.");
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update department profile.");
    }
  };

  const handleEventSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(eventForm).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      await api.post("/events", formData);
      setMessage("Department event created.");
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create event.");
    }
  };

  const handleCertificateSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/certificates", certificateForm);
      setMessage("Certificate issued.");
      setCertificateForm({ student_id: "", event_id: "", certificate_name: "" });
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not issue certificate.");
    }
  };

  const updateVolunteerRequest = async (requestId, status, preferredRole) => {
    try {
      await api.patch(`/volunteer/${requestId}/status`, {
        status,
        assigned_role: status === "assigned" ? preferredRole : ""
      });
      setMessage(`Volunteer request ${status}.`);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update volunteer request.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      setMessage("Event deleted.");
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete event.");
    }
  };

  const selectedDepartmentEventId = certificateForm.event_id
    ? String(certificateForm.event_id).split("-")[1]
    : "";
  const selectedEventStudents = selectedDepartmentEventId
    ? certificateOptions.studentsByEvent[selectedDepartmentEventId] || []
    : [];

  return (
    <section>
      <div className="hero-banner department-hero">
        <div>
          <p className="hero-tag">Welcome Department Coordinator</p>
          <h1>{dashboard.organizationName ? `${dashboard.organizationName} management dashboard` : "Manage your department from the navbar with clear, role-specific tools."}</h1>
          <p className="hero-copy">
            Use the navigation bar to update department info, create events, view events, issue certificates, and manage volunteer requests.
          </p>
        </div>
        <div className="hero-chip-stack">
          <span className="hero-chip">Events: {dashboard.totalDepartmentEvents}</span>
          <span className="hero-chip">Registrations: {dashboard.totalRegistrations}</span>
        </div>
      </div>

      {message && <p>{message}</p>}

      {section === "all" && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total Events</p>
              <h2>{dashboard.totalDepartmentEvents}</h2>
            </div>
            <div className="stat-card">
              <p>Total Registrations</p>
              <h2>{dashboard.totalRegistrations}</h2>
            </div>
            <div className="stat-card">
              <p>Pending Volunteers</p>
              <h2>{volunteerRequests.length}</h2>
            </div>
          </div>

          <div className="dashboard-home-grid">
            <div className="card spotlight-card interactive-card">
              <p className="panel-tag">Department Control Center</p>
              <h2>Keep workshops, lectures, and volunteer coordination moving smoothly.</h2>
              <p>Everything operational stays in the navbar, while this homepage gives you a polished overview of your department activity.</p>
              <div className="quick-link-grid">
                <Link className="action-tile" to="/department/about">
                  <strong>Department Info</strong>
                  <span>Update the public department page</span>
                </Link>
                <Link className="action-tile" to="/department/events">
                  <strong>Create Event</strong>
                  <span>Post a new workshop or lecture</span>
                </Link>
                <Link className="action-tile" to="/department/view-events">
                  <strong>View Events</strong>
                  <span>See volunteers and event summaries</span>
                </Link>
                <Link className="action-tile" to="/department/certificates">
                  <strong>Certificates</strong>
                  <span>Issue certificates to participants</span>
                </Link>
              </div>
            </div>

            <div className="card interactive-card">
              <p className="panel-tag">Upcoming Events</p>
              <h2>Your Department Schedule</h2>
              <div className="dashboard-list">
                {dashboard.departmentEvents.slice(0, 3).map((event) => (
                  <div className="list-row" key={event.id}>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{event.venue}</p>
                    </div>
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                ))}
                {!dashboard.departmentEvents.length && <p>No department events posted yet.</p>}
              </div>
            </div>

            <div className="card interactive-card">
              <p className="panel-tag">Volunteer Queue</p>
              <h2>Action Needed</h2>
              <p>Students who request volunteer roles for your department events appear here first and in the manage volunteers section.</p>
              <div className="metric-ribbon">
                <span>{volunteerRequests.length} pending requests</span>
                <span>{dashboard.departmentEvents.length} tracked events</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="page-grid dashboard-grid">
        {(section === "create-events") && (
        <section className="card">
          <h2>Create Department Event</h2>
          <form className="form" onSubmit={handleEventSubmit}>
            <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" />
            <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Event description" />
            <select value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
              <option value="workshop">Workshop</option>
              <option value="guest_lecture">Guest Lecture</option>
              <option value="competition">Competition</option>
            </select>
            <input value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="Venue" />
            <label className="input-label">Event date and time</label>
            <input type="datetime-local" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
            <label className="input-label">Registration deadline</label>
            <input type="datetime-local" value={eventForm.registration_deadline} onChange={(e) => setEventForm({ ...eventForm, registration_deadline: e.target.value })} />
            <input value={eventForm.seat_limit} onChange={(e) => setEventForm({ ...eventForm, seat_limit: e.target.value })} placeholder="Seat limit" />
            <input value={eventForm.volunteer_slots} onChange={(e) => setEventForm({ ...eventForm, volunteer_slots: e.target.value })} placeholder="Volunteer slots" />
            <input type="file" onChange={(e) => setEventForm({ ...eventForm, poster: e.target.files[0] })} />
            <button type="submit">Post Event</button>
          </form>
        </section>
        )}

        {(section === "view-events") && (
        <section className="card">
          <h2>View Department Events</h2>
          <div className="dashboard-list section-spacer">
            {dashboard.departmentEvents.map((event) => (
              <div className="list-row column-row" key={event.id}>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.event_type} at {event.venue}</p>
                  <p>Volunteer slots: {event.volunteer_slots}</p>
                </div>
                <div>
                  <strong>Accepted Volunteers:</strong>
                  {event.accepted_volunteers?.length ? (
                    <ul className="plain-list">
                      {event.accepted_volunteers.map((studentName) => (
                        <li key={`${event.id}-${studentName}`}>{studentName}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No accepted volunteers yet.</p>
                  )}
                </div>
                <div className="action-row">
                  <button type="button" className="secondary-button" onClick={() => handleDeleteEvent(event.id)}>
                    Delete Event
                  </button>
                </div>
              </div>
            ))}
            {!dashboard.departmentEvents.length && <p>No department events posted yet.</p>}
          </div>
        </section>
        )}

        {(section === "about") && (
        <section className="card">
          <h2>Edit Department Info</h2>
          <form className="form" onSubmit={handleProfileSave}>
            <input value={departmentProfile.description} onChange={(e) => setDepartmentProfile({ ...departmentProfile, description: e.target.value })} placeholder="Short description" />
            <textarea value={departmentProfile.about_us} onChange={(e) => setDepartmentProfile({ ...departmentProfile, about_us: e.target.value })} placeholder="About department" />
            <button type="submit">Save Department Page</button>
          </form>
        </section>
        )}

        {(section === "certificates") && (
        <section className="card">
          <h2>Issue Certificates</h2>
          <form className="form" onSubmit={handleCertificateSubmit}>
            <label className="input-label">Select event</label>
            <select
              value={certificateForm.event_id}
              onChange={(e) =>
                setCertificateForm({
                  ...certificateForm,
                  event_id: e.target.value,
                  student_id: ""
                })
              }
            >
              <option value="">Choose an event</option>
              {certificateOptions.events.map((event) => (
                <option key={event.id} value={`department-${event.id}`}>
                  {event.title} - {new Date(event.event_date).toLocaleDateString()}
                </option>
              ))}
            </select>
            <label className="input-label">Select student</label>
            <select
              value={certificateForm.student_id}
              onChange={(e) => setCertificateForm({ ...certificateForm, student_id: e.target.value })}
              disabled={!certificateForm.event_id}
            >
              <option value="">
                {certificateForm.event_id ? "Choose a registered student" : "Choose an event first"}
              </option>
              {selectedEventStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <input value={certificateForm.certificate_name} onChange={(e) => setCertificateForm({ ...certificateForm, certificate_name: e.target.value })} placeholder="Certificate name" />
            <button type="submit">Create Certificate</button>
          </form>
          {certificateForm.event_id && !selectedEventStudents.length && (
            <p className="muted-text">No registered students found for this event yet.</p>
          )}
        </section>
        )}

        {(section === "volunteers") && (
        <section className="card">
          <h2>Volunteer Requests</h2>
          <div className="dashboard-list">
            {volunteerRequests.map((request) => (
              <div className="list-row column-row" key={request.id}>
                <div>
                  <h3>{request.student_name}</h3>
                  <p>{request.title}</p>
                  <p>Preferred role: {request.preferred_role || "Not specified"}</p>
                </div>
                <div className="action-row">
                  <button type="button" onClick={() => updateVolunteerRequest(request.id, "assigned", request.preferred_role)}>
                    Accept
                  </button>
                  <button type="button" className="secondary-button" onClick={() => updateVolunteerRequest(request.id, "rejected", "")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!volunteerRequests.length && <p>No volunteer requests yet.</p>}
          </div>
        </section>
        )}
      </div>
    </section>
  );
}

export default DepartmentDashboard;
