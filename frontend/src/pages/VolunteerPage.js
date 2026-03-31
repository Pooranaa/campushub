import React, { useEffect, useState } from "react";
import api, { getPosterUrl } from "../services/api";

function VolunteerPage() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const loadVolunteerEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.filter((event) => Number(event.volunteer_slots) > 0));
    } catch (error) {
      console.error("Could not load volunteer events", error);
    }
  };

  useEffect(() => {
    loadVolunteerEvents();
  }, []);

  const handleVolunteerApply = async (eventId) => {
    try {
      setSubmittingId(eventId);
      const response = await api.post("/volunteer/apply", {
        event_id: eventId,
        preferred_role: "General Volunteer"
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Volunteer application failed");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section>
      <div className="hero-banner student-hero">
        <div>
          <p className="hero-tag">Volunteer Opportunities</p>
          <h1>See upcoming events that need extra hands and volunteer in one click.</h1>
          <p className="hero-copy">Once you apply, the respective club or department coordinator can accept or reject your request.</p>
        </div>
      </div>

      {message && <p>{message}</p>}

      <div className="page-grid">
        {events.map((eventItem) => (
          <article className="event-card card interactive-card" key={eventItem.id}>
            <div className="poster-frame">
              {eventItem.poster ? (
                <img
                  className="event-poster"
                  src={getPosterUrl(eventItem.poster)}
                  alt={`${eventItem.title} poster`}
                />
              ) : (
                <div className="poster-placeholder">
                  <span>Volunteer Needed</span>
                </div>
              )}
            </div>

            <div className="event-content">
              <div className="event-meta-row">
                <span className="event-badge">Volunteer Open</span>
                <span className="event-badge subtle-badge">{eventItem.department_name || eventItem.club_name || "Campus"}</span>
              </div>

              <h3>{eventItem.title}</h3>
              <p>{eventItem.description}</p>
              <div className="event-info-grid">
                <p><strong>Venue:</strong> {eventItem.venue}</p>
                <p><strong>Date:</strong> {new Date(eventItem.event_date).toLocaleString()}</p>
                <p><strong>Volunteer Slots:</strong> {eventItem.volunteer_slots}</p>
              </div>

              <button type="button" onClick={() => handleVolunteerApply(eventItem.id)} disabled={submittingId === eventItem.id}>
                {submittingId === eventItem.id ? "Applying..." : "Volunteer"}
              </button>
            </div>
          </article>
        ))}

        {!events.length && (
          <div className="card interactive-card">
            <h2>No volunteer openings</h2>
            <p>There are currently no upcoming events asking for volunteers.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default VolunteerPage;
