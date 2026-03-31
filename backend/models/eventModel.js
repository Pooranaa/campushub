const db = require("../config/db");

const parseCompositeEventId = (eventId) => {
  const [source, rawId] = String(eventId).split("-");
  return {
    source,
    id: Number(rawId)
  };
};

const buildCompositeEvent = (row) => ({
  ...row,
  id: `${row.event_source}-${row.raw_id}`
});

const getAllUpcomingEvents = async () => {
  const [rows] = await db.execute(
    `SELECT 'club' AS event_source,
            ce.id AS raw_id,
            ce.title,
            ce.description,
            'club_event' AS event_type,
            ce.venue,
            ce.event_date,
            ce.registration_deadline,
            ce.seat_limit,
            ce.volunteer_slots,
            ce.poster,
            cc.club_name,
            NULL AS department_name,
            ce.seat_limit - (
              SELECT COUNT(*)
              FROM event_registrations er
              WHERE er.event_source = 'club' AND er.event_id = ce.id AND er.status = 'registered'
            ) AS available_seats
     FROM club_events ce
     JOIN club_coordinators cc ON ce.club_coordinator_id = cc.id
     WHERE ce.event_date >= NOW()

     UNION ALL

     SELECT 'department' AS event_source,
            de.id AS raw_id,
            de.title,
            de.description,
            'department_event' AS event_type,
            de.venue,
            de.event_date,
            de.registration_deadline,
            de.seat_limit,
            de.volunteer_slots,
            de.poster,
            NULL AS club_name,
            dc.department_name,
            de.seat_limit - (
              SELECT COUNT(*)
              FROM event_registrations er
              WHERE er.event_source = 'department' AND er.event_id = de.id AND er.status = 'registered'
            ) AS available_seats
     FROM department_events de
     JOIN department_coordinators dc ON de.department_coordinator_id = dc.id
     WHERE de.event_date >= NOW()
     ORDER BY event_date ASC`
  );

  return rows.map(buildCompositeEvent);
};

const getEventById = async (eventId) => {
  const { source, id } = parseCompositeEventId(eventId);

  if (source === "club") {
    const [rows] = await db.execute(
      `SELECT 'club' AS event_source,
              ce.id AS raw_id,
              ce.title,
              ce.description,
              'club_event' AS event_type,
              ce.venue,
              ce.event_date,
              ce.registration_deadline,
              ce.seat_limit,
              ce.volunteer_slots,
              ce.poster,
              cc.club_name,
              NULL AS department_name,
              cc.id AS club_owner_id,
              NULL AS department_owner_id,
              ce.seat_limit - (
                SELECT COUNT(*)
                FROM event_registrations er
                WHERE er.event_source = 'club' AND er.event_id = ce.id AND er.status = 'registered'
              ) AS available_seats
       FROM club_events ce
       JOIN club_coordinators cc ON ce.club_coordinator_id = cc.id
       WHERE ce.id = ?`,
      [id]
    );

    return rows[0] ? buildCompositeEvent(rows[0]) : null;
  }

  if (source === "department") {
    const [rows] = await db.execute(
      `SELECT 'department' AS event_source,
              de.id AS raw_id,
              de.title,
              de.description,
              'department_event' AS event_type,
              de.venue,
              de.event_date,
              de.registration_deadline,
              de.seat_limit,
              de.volunteer_slots,
              de.poster,
              NULL AS club_name,
              dc.department_name,
              NULL AS club_owner_id,
              dc.id AS department_owner_id,
              de.seat_limit - (
                SELECT COUNT(*)
                FROM event_registrations er
                WHERE er.event_source = 'department' AND er.event_id = de.id AND er.status = 'registered'
              ) AS available_seats
       FROM department_events de
       JOIN department_coordinators dc ON de.department_coordinator_id = dc.id
       WHERE de.id = ?`,
      [id]
    );

    return rows[0] ? buildCompositeEvent(rows[0]) : null;
  }

  return null;
};

const createEvent = async (eventData) => {
  const {
    title,
    description,
    venue,
    event_date,
    registration_deadline,
    seat_limit,
    volunteer_slots,
    poster,
    club_coordinator_id,
    department_coordinator_id
  } = eventData;

  if (club_coordinator_id) {
    const [result] = await db.execute(
      `INSERT INTO club_events
       (club_coordinator_id, title, description, venue, event_date, registration_deadline, seat_limit, volunteer_slots, poster)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [club_coordinator_id, title, description, venue, event_date, registration_deadline, seat_limit, volunteer_slots || 0, poster || null]
    );

    return { insertId: `club-${result.insertId}` };
  }

  const [result] = await db.execute(
    `INSERT INTO department_events
     (department_coordinator_id, title, description, venue, event_date, registration_deadline, seat_limit, volunteer_slots, poster)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [department_coordinator_id, title, description, venue, event_date, registration_deadline, seat_limit, volunteer_slots || 0, poster || null]
  );

  return { insertId: `department-${result.insertId}` };
};

const countRegistrationsForEvent = async (eventId) => {
  const { source, id } = parseCompositeEventId(eventId);
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM event_registrations
     WHERE event_source = ? AND event_id = ? AND status = 'registered'`,
    [source, id]
  );

  return rows[0].total;
};

const registerStudentForEvent = async (eventId, studentId, qrCode) => {
  const { source, id } = parseCompositeEventId(eventId);
  const [result] = await db.execute(
    `INSERT INTO event_registrations (student_id, event_source, event_id, qr_code)
     VALUES (?, ?, ?, ?)`,
    [studentId, source, id, qrCode]
  );

  return result;
};

const getRegistrationsByStudent = async (studentId) => {
  const [rows] = await db.execute(
    `SELECT er.id,
            er.status,
            er.registered_at,
            er.qr_code,
            er.event_source,
            er.event_id,
            ce.title AS club_title,
            ce.event_date AS club_event_date,
            ce.venue AS club_venue,
            ce.poster AS club_poster,
            de.title AS department_title,
            de.event_date AS department_event_date,
            de.venue AS department_venue,
            de.poster AS department_poster
     FROM event_registrations er
     LEFT JOIN club_events ce ON er.event_source = 'club' AND er.event_id = ce.id
     LEFT JOIN department_events de ON er.event_source = 'department' AND er.event_id = de.id
     WHERE er.student_id = ?
     ORDER BY COALESCE(ce.event_date, de.event_date) ASC`,
    [studentId]
  );

  return rows
    .filter((row) => (row.club_title || row.department_title) && (row.club_event_date || row.department_event_date))
    .map((row) => ({
      id: row.id,
      status: row.status,
      registered_at: row.registered_at,
      qr_code: row.qr_code,
      title: row.club_title || row.department_title,
      event_date: row.club_event_date || row.department_event_date,
      venue: row.club_venue || row.department_venue,
      poster: row.club_poster || row.department_poster
    }));
};

const deleteEventById = async (eventId) => {
  const { source, id } = parseCompositeEventId(eventId);
  const table = source === "club" ? "club_events" : "department_events";
  const [result] = await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result;
};

module.exports = {
  parseCompositeEventId,
  getAllUpcomingEvents,
  getEventById,
  createEvent,
  countRegistrationsForEvent,
  registerStudentForEvent,
  getRegistrationsByStudent,
  deleteEventById
};
