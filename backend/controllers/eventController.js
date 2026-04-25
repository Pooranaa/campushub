const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
  getAllUpcomingEvents,
  getEventById,
  createEvent,
  countRegistrationsForEvent,
  registerStudentForEvent,
  deleteEventById,
  parseCompositeEventId
} = require("../models/eventModel");

const getEvents = async (req, res) => {
  try {
    const events = await getAllUpcomingEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch events.", error: error.message });
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch event details.", error: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      event_date,
      registration_deadline,
      seat_limit,
      volunteer_slots
    } = req.body;

    const poster = req.file ? req.file.filename : null;
    const result = await createEvent({
      title,
      description,
      venue,
      event_date,
      registration_deadline,
      seat_limit,
      volunteer_slots,
      poster,
      club_coordinator_id: req.user.role === "club_coordinator" ? req.user.club_id : null,
      department_coordinator_id: req.user.role === "department_coordinator" ? req.user.department_id : null
    });

    res.status(201).json({
      message: "Event created successfully.",
      eventId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create event.", error: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;
    const studentId = req.user.id;

    const event = await getEventById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const registeredCount = await countRegistrationsForEvent(event_id);
    if (registeredCount >= event.seat_limit) {
      return res.status(400).json({ message: "No seats available." });
    }

    const { source, id } = parseCompositeEventId(event_id);
    const qrToken = jwt.sign(
      {
        purpose: "event_qr",
        student_id: studentId,
        event_source: source,
        event_id: id
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const qrContent = `${publicBaseUrl}/api/events/scan/${qrToken}`;
    const qrCode = await QRCode.toDataURL(qrContent);

    await registerStudentForEvent(event_id, studentId, qrCode);

    res.status(201).json({
      message: "Registration successful.",
      qrCode
    });
  } catch (error) {
    res.status(500).json({ message: "Could not register for event.", error: error.message });
  }
};

const removeEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const ownsDepartmentEvent =
      req.user.role === "department_coordinator" &&
      Number(event.department_owner_id) === Number(req.user.department_id);
    const ownsClubEvent =
      req.user.role === "club_coordinator" &&
      Number(event.club_owner_id) === Number(req.user.club_id);

    if (!ownsDepartmentEvent && !ownsClubEvent) {
      return res.status(403).json({ message: "You do not have permission to delete this event." });
    }

    await deleteEventById(req.params.id);
    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete event.", error: error.message });
  }
};

const renderScanPage = ({ status, title, heading, details, accentColor }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CampusHub QR Verification</title>
  <style>
    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      background: linear-gradient(180deg, #f4f6f8, #e8edf3);
      color: #203046;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      width: min(100%, 640px);
      background: rgba(255, 255, 255, 0.94);
      border-radius: 28px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(19, 33, 53, 0.12);
      border: 1px solid rgba(89, 110, 138, 0.12);
    }
    .status {
      display: inline-block;
      padding: 10px 16px;
      border-radius: 999px;
      font-weight: 700;
      background: ${accentColor}20;
      color: ${accentColor};
      margin-bottom: 18px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 2rem;
    }
    p {
      margin: 0 0 12px;
      line-height: 1.6;
    }
    .detail {
      padding: 16px 18px;
      margin-top: 14px;
      border-radius: 18px;
      background: #f8fafc;
      border: 1px solid #d7e0ea;
    }
    .detail strong {
      color: #1f3957;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="status">${status}</div>
    <h1>${heading}</h1>
    <p>${title}</p>
    ${details}
  </div>
</body>
</html>
`;

const scanEventRegistration = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "event_qr") {
      return res.status(400).send(
        renderScanPage({
          status: "Invalid QR",
          heading: "This QR code is not valid.",
          title: "The scanned code does not belong to a CampusHub event registration.",
          details: "",
          accentColor: "#a34a4a"
        })
      );
    }

    const [rows] = await db.execute(
      `SELECT u.name AS student_name,
              er.status,
              ce.title AS club_title,
              ce.venue AS club_venue,
              ce.event_date AS club_event_date,
              de.title AS department_title,
              de.venue AS department_venue,
              de.event_date AS department_event_date
       FROM event_registrations er
       JOIN users u ON er.student_id = u.id
       LEFT JOIN club_events ce ON er.event_source = 'club' AND er.event_id = ce.id
       LEFT JOIN department_events de ON er.event_source = 'department' AND er.event_id = de.id
       WHERE er.student_id = ?
         AND er.event_source = ?
         AND er.event_id = ?
       LIMIT 1`,
      [decoded.student_id, decoded.event_source, decoded.event_id]
    );

    if (!rows.length) {
      return res.status(404).send(
        renderScanPage({
          status: "Not Found",
          heading: "Registration not found.",
          title: "This QR code does not match any active CampusHub registration.",
          details: "",
          accentColor: "#a34a4a"
        })
      );
    }

    const registration = rows[0];
    const eventTitle = registration.club_title || registration.department_title;
    const venue = registration.club_venue || registration.department_venue;
    const eventDate = registration.club_event_date || registration.department_event_date;
    const details = `
      <div class="detail"><strong>Student:</strong> ${registration.student_name}</div>
      <div class="detail"><strong>Event:</strong> ${eventTitle}</div>
      <div class="detail"><strong>Venue:</strong> ${venue}</div>
      <div class="detail"><strong>Date:</strong> ${new Date(eventDate).toLocaleString("en-IN")}</div>
      <div class="detail"><strong>Registration Status:</strong> ${registration.status}</div>
    `;

    return res.send(
      renderScanPage({
        status: "Verified",
        heading: `${registration.student_name} is registered.`,
        title: "CampusHub successfully verified this event QR code.",
        details,
        accentColor: "#3f6f5d"
      })
    );
  } catch (error) {
    return res.status(400).send(
      renderScanPage({
        status: "Expired or Invalid",
        heading: "This QR code could not be verified.",
        title: "The code may be expired, changed, or not generated by CampusHub.",
        details: "",
        accentColor: "#a34a4a"
      })
    );
  }
};

module.exports = {
  getEvents,
  getSingleEvent,
  addEvent,
  registerForEvent,
  removeEvent,
  scanEventRegistration
};
