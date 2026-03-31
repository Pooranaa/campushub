import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getPosterUrl } from "../services/api";

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data);
      } catch (error) {
        setErrorMessage("Could not fetch events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  return (
    <section className="fade-in-up">
      <div className="hero-banner events-hero">
        <div>
          <p className="hero-tag">Campus Events</p>
          <h1>Browse opportunities that make campus life active, social, and memorable.</h1>
          <p className="hero-copy">
            Event posters, dates, venues, and role-aware actions now live in one richer experience.
          </p>
        </div>
        {user?.role === "student" && <span className="hero-chip">Student Registration Open</span>}
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      {!events.length && !errorMessage && (
        <div className="card">
          <h3>No events yet</h3>
          <p>Create an event from an admin or coordinator account, then it will appear here.</p>
        </div>
      )}

      <div className="page-grid">
        {events.map((event) => (
          <article className="event-card card" key={event.id}>
            <div className="poster-frame">
              {event.poster ? (
                <img
                  className="event-poster"
                  src={getPosterUrl(event.poster)}
                  alt={`${event.title} poster`}
                />
              ) : (
                <div className="poster-placeholder">
                  <span>{event.event_type.replace("_", " ")}</span>
                </div>
              )}
            </div>

            <div className="event-content">
              <div className="event-meta-row">
                <span className="event-badge">{event.event_type.replace("_", " ")}</span>
                <span className="event-badge subtle-badge">{event.department_name || event.club_name || "Campus"}</span>
              </div>

              <h3>{event.title}</h3>
              <p>{event.description.slice(0, 120)}...</p>

              <div className="event-info-grid">
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
                <p><strong>Available Seats:</strong> {event.available_seats}</p>
              </div>

              <Link className="nav-button inline-button" to={`/events/${event.id}`}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventsPage;
