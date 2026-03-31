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
    <section className="center-auth fade-in-up">
      <div className="card auth-card centered-register-card auth-form-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
        <Link className="link-text auth-link" to="/register">
          New user? Create an account
        </Link>
      </div>
    </section>
  );
}

export default LoginPage;
