const db = require("../config/db");
const { getRegistrationsByStudent } = require("../models/eventModel");
const { getVolunteerAssignmentsByStudent } = require("../models/volunteerModel");

const getProfile = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const [rows] = await db.execute(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = ?`,
        [req.user.id]
      );

      return res.json({
        ...rows[0],
        role: "student"
      });
    }

    if (req.user.role === "club_coordinator") {
      const [rows] = await db.execute(
        `SELECT id, coordinator_name, club_name, email, created_at
         FROM club_coordinators
         WHERE id = ?`,
        [req.user.club_id]
      );

      return res.json({
        id: rows[0].id,
        name: rows[0].coordinator_name,
        email: rows[0].email,
        role: "club_coordinator",
        organization_name: rows[0].club_name,
        created_at: rows[0].created_at
      });
    }

    const [rows] = await db.execute(
      `SELECT id, coordinator_name, department_name, email, created_at
       FROM department_coordinators
       WHERE id = ?`,
      [req.user.department_id]
    );

    res.json({
      id: rows[0].id,
      name: rows[0].coordinator_name,
      email: rows[0].email,
      role: "department_coordinator",
      organization_name: rows[0].department_name,
      created_at: rows[0].created_at
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch profile.", error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    if (req.user.role === "department_coordinator") {
      const [[departmentInfo]] = await db.execute(
        `SELECT department_name
         FROM department_coordinators
         WHERE id = ?`,
        [req.user.department_id]
      );
      const [[eventCount]] = await db.execute(
        `SELECT COUNT(*) AS totalEvents
         FROM department_events
         WHERE department_coordinator_id = ?`,
        [req.user.department_id]
      );
      const [departmentEvents] = await db.execute(
        `SELECT CONCAT('department-', de.id) AS id,
                de.title,
                'department_event' AS event_type,
                de.venue,
                de.event_date,
                de.seat_limit,
                de.volunteer_slots,
                (
                  SELECT GROUP_CONCAT(u.name SEPARATOR '||')
                  FROM volunteer_requests vr
                  JOIN users u ON vr.student_id = u.id
                  WHERE vr.event_source = 'department' AND vr.event_id = de.id AND vr.status = 'assigned'
                ) AS accepted_volunteers
         FROM department_events de
         WHERE de.department_coordinator_id = ?
         ORDER BY de.event_date ASC`,
        [req.user.department_id]
      );
      const [[registrationCount]] = await db.execute(
        `SELECT COUNT(*) AS totalRegistrations
         FROM event_registrations er
         JOIN department_events de ON er.event_source = 'department' AND er.event_id = de.id
         WHERE de.department_coordinator_id = ?`,
        [req.user.department_id]
      );

      return res.json({
        role: "department_coordinator",
        organizationName: departmentInfo.department_name,
        totalDepartmentEvents: eventCount.totalEvents,
        totalRegistrations: registrationCount.totalRegistrations,
        departmentEvents: departmentEvents.map((event) => ({
          ...event,
          accepted_volunteers: event.accepted_volunteers ? event.accepted_volunteers.split("||") : []
        }))
      });
    }

    if (req.user.role === "club_coordinator") {
      const [[clubInfo]] = await db.execute(
        `SELECT club_name
         FROM club_coordinators
         WHERE id = ?`,
        [req.user.club_id]
      );
      const [[eventCount]] = await db.execute(
        `SELECT COUNT(*) AS totalEvents
         FROM club_events
         WHERE club_coordinator_id = ?`,
        [req.user.club_id]
      );
      const [[recruitmentCount]] = await db.execute(
        `SELECT COUNT(*) AS totalRecruitments
         FROM club_recruitments
         WHERE club_coordinator_id = ?`,
        [req.user.club_id]
      );
      const [clubEvents] = await db.execute(
        `SELECT CONCAT('club-', ce.id) AS id,
                ce.title,
                'club_event' AS event_type,
                ce.venue,
                ce.event_date,
                ce.seat_limit,
                ce.volunteer_slots,
                (
                  SELECT GROUP_CONCAT(u.name SEPARATOR '||')
                  FROM volunteer_requests vr
                  JOIN users u ON vr.student_id = u.id
                  WHERE vr.event_source = 'club' AND vr.event_id = ce.id AND vr.status = 'assigned'
                ) AS accepted_volunteers
         FROM club_events ce
         WHERE ce.club_coordinator_id = ?
         ORDER BY ce.event_date ASC`,
        [req.user.club_id]
      );
      const [recentRecruitments] = await db.execute(
        `SELECT id, title, deadline, created_at
         FROM club_recruitments
         WHERE club_coordinator_id = ?
         ORDER BY created_at DESC
         LIMIT 5`,
        [req.user.club_id]
      );

      return res.json({
        role: "club_coordinator",
        organizationName: clubInfo.club_name,
        totalClubEvents: eventCount.totalEvents,
        totalRecruitments: recruitmentCount.totalRecruitments,
        clubEvents: clubEvents.map((event) => ({
          ...event,
          accepted_volunteers: event.accepted_volunteers ? event.accepted_volunteers.split("||") : []
        })),
        recentRecruitments
      });
    }

    const registeredEvents = await getRegistrationsByStudent(req.user.id);
    const volunteerAssignments = await getVolunteerAssignmentsByStudent(req.user.id);

    const [applications] = await db.execute(
      `SELECT ra.id, ra.status, cr.title
       FROM recruitment_applications ra
       JOIN club_recruitments cr ON ra.club_recruitment_id = cr.id
       WHERE ra.student_id = ?`,
      [req.user.id]
    );

    const [certificates] = await db.execute(
      `SELECT c.id, c.certificate_name, c.file_path
       FROM certificates c
       WHERE c.student_id = ?`,
      [req.user.id]
    );

    res.json({
      role: "student",
      upcomingEvents: registeredEvents,
      volunteerAssignments,
      recruitmentApplications: applications,
      certificates
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch dashboard.", error: error.message });
  }
};

module.exports = {
  getProfile,
  getDashboard
};
