const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
  try {
    const { name, email, password, role, organization_name } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    if ((role === "club_coordinator" || role === "department_coordinator") && !organization_name) {
      return res.status(400).json({ message: "Please enter the club or department name." });
    }

    const [studentRows] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    const [clubRows] = await db.execute("SELECT id FROM club_coordinators WHERE email = ?", [email]);
    const [departmentRows] = await db.execute("SELECT id FROM department_coordinators WHERE email = ?", [email]);

    if (studentRows.length || clubRows.length || departmentRows.length) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "student") {
      await db.execute(
        `INSERT INTO users (name, email, password)
         VALUES (?, ?, ?)`,
        [name, email, hashedPassword]
      );
    } else if (role === "club_coordinator") {
      await db.execute(
        `INSERT INTO club_coordinators (coordinator_name, club_name, email, password)
         VALUES (?, ?, ?, ?)`,
        [name, organization_name, email, hashedPassword]
      );
    } else if (role === "department_coordinator") {
      await db.execute(
        `INSERT INTO department_coordinators (coordinator_name, department_name, email, password)
         VALUES (?, ?, ?, ?)`,
        [name, organization_name, email, hashedPassword]
      );
    } else {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [studentRows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (studentRows.length) {
      const student = studentRows[0];
      const isPasswordValid = await bcrypt.compare(password, student.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign(
        {
          id: student.id,
          role: "student",
          name: student.name,
          email: student.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful.",
        token,
        user: {
          id: student.id,
          role: "student",
          name: student.name,
          email: student.email,
          club_id: null,
          department_id: null
        }
      });
    }

    const [clubRows] = await db.execute("SELECT * FROM club_coordinators WHERE email = ?", [email]);
    if (clubRows.length) {
      const clubCoordinator = clubRows[0];
      const isPasswordValid = await bcrypt.compare(password, clubCoordinator.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign(
        {
          id: clubCoordinator.id,
          role: "club_coordinator",
          name: clubCoordinator.coordinator_name,
          email: clubCoordinator.email,
          club_id: clubCoordinator.id,
          club_name: clubCoordinator.club_name
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful.",
        token,
        user: {
          id: clubCoordinator.id,
          role: "club_coordinator",
          name: clubCoordinator.coordinator_name,
          email: clubCoordinator.email,
          club_id: clubCoordinator.id,
          club_name: clubCoordinator.club_name,
          department_id: null
        }
      });
    }

    const [departmentRows] = await db.execute("SELECT * FROM department_coordinators WHERE email = ?", [email]);
    if (departmentRows.length) {
      const departmentCoordinator = departmentRows[0];
      const isPasswordValid = await bcrypt.compare(password, departmentCoordinator.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign(
        {
          id: departmentCoordinator.id,
          role: "department_coordinator",
          name: departmentCoordinator.coordinator_name,
          email: departmentCoordinator.email,
          department_id: departmentCoordinator.id,
          department_name: departmentCoordinator.department_name
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful.",
        token,
        user: {
          id: departmentCoordinator.id,
          role: "department_coordinator",
          name: departmentCoordinator.coordinator_name,
          email: departmentCoordinator.email,
          department_id: departmentCoordinator.id,
          department_name: departmentCoordinator.department_name,
          club_id: null
        }
      });
    }

    res.status(404).json({ message: "User not found." });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

module.exports = {
  register,
  login
};
