import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    organization_name: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/register", formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  const needsOrganization = formData.role === "club_coordinator" || formData.role === "department_coordinator";

  return (
    <section className="center-auth fade-in-up">
      <div className="card auth-card centered-register-card interactive-card">
        <h1>Register</h1>
        <p className="section-text">Create a student, club coordinator, or department coordinator account.</p>
        <form onSubmit={handleSubmit} className="form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="club_coordinator">Club Coordinator</option>
            <option value="department_coordinator">Department Coordinator</option>
          </select>

          {needsOrganization && (
            <input
              type="text"
              name="organization_name"
              placeholder={formData.role === "club_coordinator" ? "Enter club name" : "Enter department name"}
              value={formData.organization_name}
              onChange={handleChange}
            />
          )}

          <button type="submit">Create Account</button>
        </form>
        <p>{message}</p>
        <Link className="link-text" to="/login">
          Already have an account? Login
        </Link>
      </div>
    </section>
  );
}

export default RegisterPage;
