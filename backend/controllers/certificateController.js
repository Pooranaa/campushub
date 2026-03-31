const db = require("../config/db");
const { issueCertificate } = require("../models/certificateModel");

const getCertificateOptions = async (req, res) => {
  try {
    const [events] = await db.execute(
      `SELECT id, title, event_date
       FROM department_events
       WHERE department_coordinator_id = ?
       ORDER BY event_date ASC`,
      [req.user.department_id]
    );

    const [registrations] = await db.execute(
      `SELECT er.event_id AS department_event_id,
              u.id AS student_id,
              u.name AS student_name
       FROM event_registrations er
       JOIN department_events de
         ON er.event_source = 'department' AND er.event_id = de.id
       JOIN users u ON er.student_id = u.id
       WHERE de.department_coordinator_id = ?
         AND er.status IN ('registered', 'attended')
       ORDER BY de.event_date ASC, u.name ASC`,
      [req.user.department_id]
    );

    const studentsByEvent = registrations.reduce((accumulator, registration) => {
      const key = String(registration.department_event_id);

      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push({
        id: registration.student_id,
        name: registration.student_name
      });

      return accumulator;
    }, {});

    res.json({
      events,
      studentsByEvent
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch certificate options.", error: error.message });
  }
};

const createCertificate = async (req, res) => {
  try {
    const { student_id, event_id, certificate_name } = req.body;

    if (!String(event_id).startsWith("department-")) {
      return res.status(400).json({ message: "Certificates can only be issued for department events." });
    }

    const departmentEventId = Number(String(event_id).split("-")[1]);
    const [[event]] = await db.execute(
      `SELECT id, department_coordinator_id
       FROM department_events
       WHERE id = ?`,
      [departmentEventId]
    );

    if (!event) {
      return res.status(404).json({ message: "Department event not found." });
    }

    if (Number(event.department_coordinator_id) !== Number(req.user.department_id)) {
      return res.status(403).json({ message: "You can only issue certificates for your department events." });
    }

    const [[studentRegistration]] = await db.execute(
      `SELECT er.id
       FROM event_registrations er
       WHERE er.student_id = ?
         AND er.event_source = 'department'
         AND er.event_id = ?
         AND er.status IN ('registered', 'attended')`,
      [student_id, departmentEventId]
    );

    if (!studentRegistration) {
      return res.status(400).json({ message: "This student is not registered for the selected event." });
    }

    const filePath = `/certificates/${certificate_name.replace(/\s+/g, "-").toLowerCase()}-${student_id}-${departmentEventId}.pdf`;

    const result = await issueCertificate({
      student_id,
      department_event_id: departmentEventId,
      certificate_name,
      file_path: filePath
    });

    res.status(201).json({
      message: "Certificate created successfully.",
      certificateId: result.insertId,
      filePath
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create certificate.", error: error.message });
  }
};

module.exports = {
  getCertificateOptions,
  createCertificate
};
