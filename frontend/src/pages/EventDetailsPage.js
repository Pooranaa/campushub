import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getPosterUrl } from "../services/api";

function EventDetailsPage({ user }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Could not load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    try {
      const response = await api.post("/events/register", { event_id: eventId });
      setMessage(response.data.message);
      setQrCode(response.data.qrCode);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (!event) {
    return (
      <section className="card">
        <h1>Event not found</h1>
        <p>{message || "We could not find that event."}</p>
        <Link className="nav-button inline-button" to="/events">
          Back to Events
        </Link>
      </section>
    );
  }

  return (
    <section className="card event-detail-card fade-in-up">
      <Link className="link-text back-link" to="/events">
        Back to Events
      </Link>
      <div className="event-detail-layout">
        <div className="event-detail-poster">
          {event.poster ? (
            <img
              className="event-poster detail-poster"
              src={getPosterUrl(event.poster)}
              alt={`${event.title} poster`}
            />
          ) : (
            <div className="poster-placeholder detail-placeholder">
              <span>{event.event_type.replace("_", " ")}</span>
            </div>
          )}
        </div>

        <div className="event-detail-content">
          <div className="event-meta-row">
            <span className="event-badge">{event.event_type.replace("_", " ")}</span>
            <span className="event-badge subtle-badge">{event.department_name || event.club_name || "Campus"}</span>
          </div>

          <h1>{event.title}</h1>
          <p className="event-lead">{event.description}</p>
          <div className="event-info-grid">
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
            <p><strong>Registration Deadline:</strong> {new Date(event.registration_deadline).toLocaleString()}</p>
            <p><strong>Available Seats:</strong> {event.available_seats}</p>
            <p><strong>Total Seats:</strong> {event.seat_limit}</p>
            <p><strong>Volunteer Slots:</strong> {event.volunteer_slots}</p>
            {event.department_name && <p><strong>Department:</strong> {event.department_name}</p>}
            {event.club_name && <p><strong>Club:</strong> {event.club_name}</p>}
          </div>

          {user?.role === "student" ? (
            <button onClick={handleRegister}>Register for Event</button>
          ) : (
            <p className="section-text">Only students can register. Coordinators can view the full details here.</p>
          )}

          <p>{message}</p>

          {qrCode && (
            <div className="qr-card">
              <h3>Your QR Code</h3>
              <img src={qrCode} alt="Event QR Code" className="qr-image" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventDetailsPage;
