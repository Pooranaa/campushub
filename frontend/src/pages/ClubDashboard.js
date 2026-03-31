import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ClubDashboard({ section = "all" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [dashboard, setDashboard] = useState({
    totalClubEvents: 0,
    totalRecruitments: 0,
    clubEvents: [],
    recentRecruitments: []
  });
  const [managedRecruitments, setManagedRecruitments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [clubProfile, setClubProfile] = useState({
    description: "",
    about_us: ""
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_type: "club_event",
    venue: "",
    event_date: "",
    registration_deadline: "",
    seat_limit: "",
    volunteer_slots: "",
    poster: null
  });
  const [recruitmentForm, setRecruitmentForm] = useState({
    title: "",
    description: "",
    deadline: "",
    questionsText: "Any portfolio links?\nWhich team would you like to work with?"
  });
  const [volunteerRequests, setVolunteerRequests] = useState([]);
  const [message, setMessage] = useState("");

  const isDuplicateDefaultQuestion = (question) => {
    const normalized = String(question || "").trim().toLowerCase();
    return normalized === "why do you want to join?" || normalized === "what skills can you contribute?";
  };

  const loadDashboard = async () => {
    if (!user.club_id) {
      setMessage("This club coordinator account is not linked to a club yet. Please register again and choose a club.");
      return;
    }

    try {
      const results = await Promise.allSettled([
        api.get("/user/dashboard"),
        api.get("/volunteer/requests"),
        api.get(`/clubs/${user.club_id}`),
        api.get("/clubs/recruitment/manage"),
        api.get("/clubs/recruitment/applications")
      ]);

      const [dashboardResult, volunteerResult, clubResult, recruitmentResult, applicationResult] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data);
      }

      if (volunteerResult.status === "fulfilled") {
        setVolunteerRequests(volunteerResult.value.data);
      }

      if (clubResult.status === "fulfilled") {
        setClubProfile({
          description: clubResult.value.data.description || "",
          about_us: clubResult.value.data.about_us || ""
        });
      }

      if (recruitmentResult.status === "fulfilled") {
        setManagedRecruitments(recruitmentResult.value.data);
      }

      if (applicationResult.status === "fulfilled") {
        setApplications(applicationResult.value.data);
      }

      const failedRequest = results.find((result) => result.status === "rejected");

      if (failedRequest) {
        console.error("Part of the club dashboard failed to load", failedRequest.reason);
      }
    } catch (error) {
      console.error("Could not load club dashboard", error);
    }
  };

  useEffect(() => {
    if (user.club_id) {
      loadDashboard();
    }
  }, [user.club_id, section]);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/clubs/${user.club_id}`, {
        description: clubProfile.description,
        about_us: clubProfile.about_us,
        members: []
      });
      setMessage("Club profile updated.");
      setClubProfile({
        description: "",
        about_us: ""
      });
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update club profile.");
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
      setMessage("Club event created.");
      setEventForm({
        title: "",
        description: "",
        event_type: "club_event",
        venue: "",
        event_date: "",
        registration_deadline: "",
        seat_limit: "",
        volunteer_slots: "",
        poster: null
      });
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create event.");
    }
  };

  const handleRecruitmentSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!recruitmentForm.title.trim() || !recruitmentForm.description.trim() || !recruitmentForm.deadline) {
        setMessage("Please fill the recruitment title, description, and deadline.");
        return;
      }

      const formattedDeadline = recruitmentForm.deadline.replace("T", " ") + ":00";
      setMessage("Creating recruitment...");

      const payload = {
        title: recruitmentForm.title.trim(),
        description: recruitmentForm.description.trim(),
        deadline: formattedDeadline,
        questions: recruitmentForm.questionsText.split("\n").map((item) => item.trim()).filter(Boolean)
      };

      const response = await api.post("/clubs/recruitment", payload);
      setMessage("Recruitment created successfully.");
      setRecruitmentForm({
        title: "",
        description: "",
        deadline: "",
        questionsText: "Any portfolio links?\nWhich team would you like to work with?"
      });

      try {
        const recruitmentResponse = await api.get("/clubs/recruitment/manage");
        setManagedRecruitments(recruitmentResponse.data);
      } catch (refreshError) {
        setManagedRecruitments((previous) => ([
          {
            id: response.data.recruitmentId,
            title: payload.title,
            description: payload.description,
            deadline: payload.deadline,
            questions: payload.questions,
            created_at: new Date().toISOString()
          },
          ...previous
        ]));
      }

      setDashboard((previous) => ({
        ...previous,
        totalRecruitments: previous.totalRecruitments + 1,
        recentRecruitments: [
          {
            id: response.data.recruitmentId,
            title: payload.title,
            deadline: payload.deadline,
            created_at: new Date().toISOString()
          },
          ...(previous.recentRecruitments || [])
        ].slice(0, 5)
      }));

      navigate("/club/view-recruitments");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create recruitment.");
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

  const handleDeleteRecruitment = async (recruitmentId) => {
    try {
      await api.delete(`/clubs/recruitment/${recruitmentId}`);
      setMessage("Recruitment deleted.");
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete recruitment.");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.patch(`/clubs/recruitment/applications/${applicationId}/status`, { status });
      setMessage(`Application ${status}.`);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update application.");
    }
  };

  return (
    <section>
      <div className="hero-banner club-hero">
        <div>
          
          <h1>{dashboard.organizationName ? `${dashboard.organizationName} ` : "Run your club from the navbar with focused management tools."}</h1>
          
        </div>
        <div className="hero-chip-stack">
          <span className="hero-chip">Events: {dashboard.totalClubEvents}</span>
          <span className="hero-chip">Recruitments: {dashboard.totalRecruitments}</span>
        </div>
      </div>

      {message && <p>{message}</p>}

      {section === "all" && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total Events</p>
              <h2>{dashboard.totalClubEvents}</h2>
            </div>
            <div className="stat-card">
              <p>Recruitments</p>
              <h2>{dashboard.totalRecruitments}</h2>
            </div>
            <div className="stat-card">
              <p>Pending Volunteers</p>
              <h2>{volunteerRequests.length}</h2>
            </div>
          </div>

          <div className="dashboard-home-grid dashboard-home-grid-compact">
            <div className="card interactive-card">
              
              <h2>Upcoming Events</h2>
              <div className="dashboard-list">
                {dashboard.clubEvents.slice(0, 3).map((event) => (
                  <div className="list-row" key={event.id}>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{event.venue}</p>
                    </div>
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                ))}
                {!dashboard.clubEvents.length && <p>No club events posted yet.</p>}
              </div>
            </div>

            <div className="card interactive-card">
              
              <h2>Recruitment Activity</h2>
              <div className="metric-ribbon">
                <span>{volunteerRequests.length} pending requests</span>
                <span>{managedRecruitments.length} recruitment drives tracked</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="page-grid dashboard-grid">
        {section === "create-events" && (
          <section className="card">
            <h2>Create Club Event</h2>
            <form className="form" onSubmit={handleEventSubmit}>
              <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" />
              <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Event description" />
              <select value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
                <option value="club_event">Club Event</option>
                <option value="competition">Competition</option>
                <option value="recruitment_drive">Recruitment Drive</option>
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

        {section === "view-events" && (
          <section className="card">
            <h2>View Club Events</h2>
            <div className="dashboard-list section-spacer">
              {dashboard.clubEvents.map((event) => (
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
              {!dashboard.clubEvents.length && <p>No club events posted yet.</p>}
            </div>
          </section>
        )}

        {section === "create-recruitments" && (
          <section className="card">
            <h2>Create Recruitment</h2>
            <form className="form" onSubmit={handleRecruitmentSubmit}>
              <input value={recruitmentForm.title} onChange={(e) => setRecruitmentForm({ ...recruitmentForm, title: e.target.value })} placeholder="Recruitment title" />
              <textarea value={recruitmentForm.description} onChange={(e) => setRecruitmentForm({ ...recruitmentForm, description: e.target.value })} placeholder="Recruitment description" />
              <label className="input-label">Recruitment deadline</label>
              <input type="datetime-local" value={recruitmentForm.deadline} onChange={(e) => setRecruitmentForm({ ...recruitmentForm, deadline: e.target.value })} />
              <label className="input-label">Applicant questions</label>
              <textarea value={recruitmentForm.questionsText} onChange={(e) => setRecruitmentForm({ ...recruitmentForm, questionsText: e.target.value })} placeholder="One question per line" />
              <button type="submit">Create Recruitment</button>
            </form>
          </section>
        )}

        {section === "view-recruitments" && (
          <section className="card">
            <h2>View Recruitments</h2>
            <div className="dashboard-list section-spacer">
              {(managedRecruitments.length ? managedRecruitments : dashboard.recentRecruitments).map((recruitment) => {
                const allRecruitmentApplications = applications.filter(
                  (application) => Number(application.recruitment_id) === Number(recruitment.id)
                );
                const recruitmentApplications = allRecruitmentApplications.filter(
                  (application) => application.status === "pending"
                );
                const applicationCount = allRecruitmentApplications.length;

                return (
                  <div className="list-row column-row" key={recruitment.id}>
                    <div>
                      <h3>{recruitment.title}</h3>
                      <p>{recruitment.description}</p>
                      <p>Deadline: {new Date(recruitment.deadline).toLocaleString()}</p>
                      <p>Applications received: {applicationCount}</p>
                    </div>
                    <div className="wide-card">
                      <strong>Pending Applications ({recruitmentApplications.length})</strong>
                      <div className="dashboard-list section-spacer">
                        {recruitmentApplications.map((application) => (
                          <div className="list-row column-row" key={application.id}>
                            <div>
                              <h3>{application.student_name}</h3>
                              <p>Status: {application.status}</p>
                              {application.answers
                                .filter((entry) => !isDuplicateDefaultQuestion(entry.question))
                                .map((entry, index) => (
                                <p key={`${application.id}-${index}`}>
                                  <strong>{entry.question}:</strong> {entry.answer}
                                </p>
                              ))}
                            </div>
                            <div className="action-row">
                              <button type="button" onClick={() => updateApplicationStatus(application.id, "accepted")}>
                                Accept
                              </button>
                              <button type="button" className="secondary-button" onClick={() => updateApplicationStatus(application.id, "rejected")}>
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                        {!recruitmentApplications.length && <p>No pending applications right now.</p>}
                      </div>
                    </div>
                    <div className="action-row">
                      <button type="button" className="secondary-button" onClick={() => handleDeleteRecruitment(recruitment.id)}>
                        Delete Recruitment
                      </button>
                    </div>
                  </div>
                );
              })}
              {!managedRecruitments.length && <p>No recruitments created yet.</p>}
            </div>
          </section>
        )}

        {section === "about" && (
          <section className="card">
            <h2>Edit Club Info</h2>
            <form className="form" onSubmit={handleProfileSave}>
              <input value={clubProfile.description} onChange={(e) => setClubProfile({ ...clubProfile, description: e.target.value })} placeholder="Short description" />
              <textarea value={clubProfile.about_us} onChange={(e) => setClubProfile({ ...clubProfile, about_us: e.target.value })} placeholder="About us" />
              <button type="submit">Save Club Page</button>
            </form>
          </section>
        )}

        {section === "volunteers" && (
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

export default ClubDashboard;
