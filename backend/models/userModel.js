const db = require("../config/db");

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT id, name, email, password, created_at
     FROM users
     WHERE email = ?`,
    [email]
  );

  return rows[0];
};

const createUser = async (userData) => {
  const { name, email, password } = userData;

  const [result] = await db.execute(
    `INSERT INTO users (name, email, password)
     VALUES (?, ?, ?)`,
    [name, email, password]
  );

  return result;
};

const findUserById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
