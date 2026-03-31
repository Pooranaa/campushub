import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);
      setMessage(response.data.message);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="auth-layout fade-in-up">
      <div className="auth-panel auth-panel-left">
        <p className="hero-tag auth-tag">CampusHub</p>
        <h1>One place for campus clubs, departments, workshops, recruitments, and student participation.</h1>
        <p className="hero-copy">
          Login with your role-specific account and CampusHub will take you to the correct dashboard automatically.
        </p>

        <div className="role-preview-grid">
          <div className="glass-card">
            <h3>Student</h3>
            <p>Discover events, register, volunteer, and track your participation history.</p>
          </div>
          <div className="glass-card">
            <h3>Club Admin</h3>
            <p>Handle recruitments, volunteers, and club-led events with a dedicated dashboard.</p>
          </div>
          <div className="glass-card">
            <h3>Department Admin</h3>
            <p>Manage lectures and academic activities without seeing club-only tools.</p>
          </div>
        </div>
      </div>

      <div className="auth-panel auth-panel-right">
        <div className="card auth-card">
          <h1>Login</h1>
          <p className="section-text">Your permissions depend on the role of the account you use.</p>
          <p className="muted-text">Students see all campus information. Club and department coordinators only see the records that belong to their own organization.</p>
          <form onSubmit={handleSubmit} className="form">
            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
          </form>
          {message && <p>{message}</p>}
          <Link className="link-text" to="/register">
            New user? Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
