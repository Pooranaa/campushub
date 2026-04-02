import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    organization_name: "",
    verification_code: "",
    password: "",
    confirm_password: ""
  });
  const [message, setMessage] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSendCode = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/send-verification-code", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organization_name: formData.organization_name
      });
      setMessage(response.data.message);
      setCodeSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not send verification code");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/register", formData);
      setMessage(response.data.message);
      setFormData({
        name: "",
        email: "",
        role: "student",
        organization_name: "",
        verification_code: "",
        password: "",
        confirm_password: ""
      });
      setCodeSent(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  const needsOrganization = formData.role === "club_coordinator" || formData.role === "department_coordinator";

  return (
    <section className="center-auth fade-in-up">
      <div className="card auth-card centered-register-card auth-form-card interactive-card">
        <h1>Register</h1>
        <form onSubmit={codeSent ? handleSubmit : handleSendCode} className="form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

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

          {codeSent && (
            <>
              <input
                type="text"
                name="verification_code"
                placeholder="Enter verification code"
                value={formData.verification_code}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
              />
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit">{codeSent ? "Verify and Create Account" : "Send Verification Code"}</button>
        </form>
        {message && <p>{message}</p>}
        <Link className="link-text auth-link" to="/login">
          Already have an account? Login
        </Link>
      </div>
    </section>
  );
}

export default RegisterPage;
