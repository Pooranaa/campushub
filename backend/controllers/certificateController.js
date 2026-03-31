const db = require("../config/db");
const { issueCertificate } = require("../models/certificateModel");

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
  createCertificate
};
