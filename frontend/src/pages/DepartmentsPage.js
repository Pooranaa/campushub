import React, { useEffect, useState } from "react";
import api from "../services/api";

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Could not fetch departments", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <section>
      <div className="hero-banner department-hero">
        <div>
          
          <h1>About the Departments</h1>
          
        </div>
      </div>

      <div className="page-grid">
        {departments.map((department) => (
          <section className="card interactive-card" key={department.id}>
            <h2>{department.name}</h2>
            <p><strong>Description:</strong> {department.description || "No description yet."}</p>
            <p><strong>About Us:</strong> {department.about_us || "Department coordinator has not updated this section yet."}</p>
          </section>
        ))}
      </div>
    </section>
  );
}

export default DepartmentsPage;
