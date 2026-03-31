const QRCode = require("qrcode");
const {
  getAllUpcomingEvents,
  getEventById,
  createEvent,
  countRegistrationsForEvent,
  registerStudentForEvent,
  deleteEventById
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

    const qrContent = `event:${event_id}|student:${studentId}|time:${Date.now()}`;
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

module.exports = {
  getEvents,
  getSingleEvent,
  addEvent,
  registerForEvent,
  removeEvent
};
