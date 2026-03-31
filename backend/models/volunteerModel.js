const db = require("../config/db");
const { parseCompositeEventId } = require("./eventModel");

const applyForVolunteerRole = async (volunteerData) => {
  const { event_id, student_id, preferred_role } = volunteerData;
  const { source, id } = parseCompositeEventId(event_id);

  const [result] = await db.execute(
    `INSERT INTO volunteer_requests (student_id, event_source, event_id, preferred_role)
     VALUES (?, ?, ?, ?)`,
    [student_id, source, id, preferred_role]
  );

  return result;
};

const getVolunteerAssignmentsByStudent = async (studentId) => {
  const [rows] = await db.execute(
    `SELECT vr.id, vr.preferred_role, vr.assigned_role, vr.status,
            ce.title AS club_title, ce.event_date AS club_event_date,
            de.title AS department_title, de.event_date AS department_event_date
     FROM volunteer_requests vr
     LEFT JOIN club_events ce ON vr.event_source = 'club' AND vr.event_id = ce.id
     LEFT JOIN department_events de ON vr.event_source = 'department' AND vr.event_id = de.id
     WHERE vr.student_id = ?
     ORDER BY COALESCE(ce.event_date, de.event_date) ASC`,
    [studentId]
  );

  return rows.map((row) => ({
    id: row.id,
    preferred_role: row.preferred_role,
    assigned_role: row.assigned_role,
    status: row.status,
    title: row.club_title || row.department_title,
    event_date: row.club_event_date || row.department_event_date
  }));
};

const getVolunteerRequestsForCoordinator = async (role, relatedId) => {
  if (role === "club_coordinator") {
    const [rows] = await db.execute(
      `SELECT vr.id, vr.preferred_role, vr.assigned_role, vr.status, vr.applied_at,
              CONCAT('club-', ce.id) AS event_id, ce.title,
              u.id AS student_id, u.name AS student_name, u.email AS student_email
       FROM volunteer_requests vr
       JOIN club_events ce ON vr.event_source = 'club' AND vr.event_id = ce.id
       JOIN users u ON vr.student_id = u.id
       WHERE ce.club_coordinator_id = ? AND vr.status = 'applied'
       ORDER BY vr.applied_at DESC`,
      [relatedId]
    );

    return rows;
  }

  const [rows] = await db.execute(
    `SELECT vr.id, vr.preferred_role, vr.assigned_role, vr.status, vr.applied_at,
            CONCAT('department-', de.id) AS event_id, de.title,
            u.id AS student_id, u.name AS student_name, u.email AS student_email
     FROM volunteer_requests vr
     JOIN department_events de ON vr.event_source = 'department' AND vr.event_id = de.id
     JOIN users u ON vr.student_id = u.id
     WHERE de.department_coordinator_id = ? AND vr.status = 'applied'
     ORDER BY vr.applied_at DESC`,
    [relatedId]
  );

  return rows;
};

const updateVolunteerStatus = async (id, status, assignedRole) => {
  const [result] = await db.execute(
    `UPDATE volunteer_requests
     SET status = ?, assigned_role = ?
     WHERE id = ?`,
    [status, assignedRole || null, id]
  );

  return result;
};

module.exports = {
  applyForVolunteerRole,
  getVolunteerAssignmentsByStudent,
  getVolunteerRequestsForCoordinator,
  updateVolunteerStatus
};
