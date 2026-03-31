const db = require("../config/db");

const getAllClubs = async () => {
  const [rows] = await db.execute(
    `SELECT id, club_name AS name, description, about_us, coordinator_name, email, created_at
     FROM club_coordinators
     ORDER BY club_name ASC`
  );
  return rows;
};

const getClubById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, club_name AS name, description, about_us, coordinator_name, email, created_at
     FROM club_coordinators
     WHERE id = ?`,
    [id]
  );
  return rows[0];
};

const updateClubProfile = async (id, profileData) => {
  const { description, about_us } = profileData;

  const [result] = await db.execute(
    `UPDATE club_coordinators
     SET description = ?, about_us = ?
     WHERE id = ?`,
    [description, about_us, id]
  );

  return result;
};

const createRecruitment = async (recruitmentData) => {
  const { club_coordinator_id, title, description, questions, deadline } = recruitmentData;

  const [result] = await db.execute(
    `INSERT INTO club_recruitments (club_coordinator_id, title, description, questions, deadline)
     VALUES (?, ?, ?, ?, ?)`,
    [club_coordinator_id, title, description, questions, deadline]
  );

  return result;
};

const getOpenRecruitments = async () => {
  const [rows] = await db.execute(
    `SELECT cr.id, cr.title, cr.description, cr.questions, cr.deadline, cr.created_at,
            cc.club_name
     FROM club_recruitments cr
     JOIN club_coordinators cc ON cr.club_coordinator_id = cc.id
     ORDER BY cr.deadline ASC`
  );

  return rows;
};

const getRecruitmentsByClub = async (clubCoordinatorId) => {
  const [rows] = await db.execute(
    `SELECT cr.id, cr.title, cr.description, cr.questions, cr.deadline, cr.created_at,
            cc.club_name
     FROM club_recruitments cr
     JOIN club_coordinators cc ON cr.club_coordinator_id = cc.id
     WHERE cr.club_coordinator_id = ?
     ORDER BY cr.created_at DESC`,
    [clubCoordinatorId]
  );

  return rows;
};

const applyToRecruitment = async (applicationData) => {
  const { club_recruitment_id, student_id, answers } = applicationData;

  const [result] = await db.execute(
    `INSERT INTO recruitment_applications (club_recruitment_id, student_id, answers)
     VALUES (?, ?, ?)`,
    [club_recruitment_id, student_id, answers]
  );

  return result;
};

const findRecruitmentApplication = async (recruitmentId, studentId) => {
  const [rows] = await db.execute(
    `SELECT id, status
     FROM recruitment_applications
     WHERE club_recruitment_id = ? AND student_id = ?`,
    [recruitmentId, studentId]
  );

  return rows[0];
};

const getRecruitmentApplicationsForClub = async (clubCoordinatorId) => {
  const [rows] = await db.execute(
    `SELECT ra.id, ra.status, ra.answers, ra.applied_at,
            cr.id AS recruitment_id, cr.title,
            u.id AS student_id, u.name AS student_name, u.email AS student_email
     FROM recruitment_applications ra
     JOIN club_recruitments cr ON ra.club_recruitment_id = cr.id
     JOIN users u ON ra.student_id = u.id
     WHERE cr.club_coordinator_id = ?
     ORDER BY ra.applied_at DESC`,
    [clubCoordinatorId]
  );

  return rows;
};

const updateRecruitmentApplicationStatus = async (applicationId, status) => {
  const [result] = await db.execute(
    `UPDATE recruitment_applications
     SET status = ?
     WHERE id = ?`,
    [status, applicationId]
  );

  return result;
};

const getRecruitmentById = async (recruitmentId) => {
  const [rows] = await db.execute("SELECT * FROM club_recruitments WHERE id = ?", [recruitmentId]);
  return rows[0];
};

const deleteRecruitmentById = async (recruitmentId) => {
  const [result] = await db.execute("DELETE FROM club_recruitments WHERE id = ?", [recruitmentId]);
  return result;
};

module.exports = {
  getAllClubs,
  getClubById,
  updateClubProfile,
  createRecruitment,
  getOpenRecruitments,
  getRecruitmentsByClub,
  applyToRecruitment,
  findRecruitmentApplication,
  getRecruitmentApplicationsForClub,
  updateRecruitmentApplicationStatus,
  getRecruitmentById,
  deleteRecruitmentById
};
