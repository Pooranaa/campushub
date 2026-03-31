const db = require("../config/db");

const issueCertificate = async (certificateData) => {
  const { student_id, department_event_id, certificate_name, file_path } = certificateData;

  const [result] = await db.execute(
    `INSERT INTO certificates (student_id, department_event_id, certificate_name, file_path)
     VALUES (?, ?, ?, ?)`,
    [student_id, department_event_id, certificate_name, file_path]
  );

  return result;
};

module.exports = {
  issueCertificate
};
