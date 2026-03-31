const db = require("../config/db");

const getAllDepartments = async () => {
  const [rows] = await db.execute(
    `SELECT id, department_name AS name, description, about_us, coordinator_name, email, created_at
     FROM department_coordinators
     ORDER BY department_name ASC`
  );
  return rows;
};

const getDepartmentById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, department_name AS name, description, about_us, coordinator_name, email, created_at
     FROM department_coordinators
     WHERE id = ?`,
    [id]
  );
  return rows[0];
};

const updateDepartmentProfile = async (id, profileData) => {
  const { description, about_us } = profileData;

  const [result] = await db.execute(
    `UPDATE department_coordinators
     SET description = ?, about_us = ?
     WHERE id = ?`,
    [description, about_us, id]
  );

  return result;
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  updateDepartmentProfile
};
