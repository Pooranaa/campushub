import React, { useEffect, useState } from "react";
import api from "../services/api";

function ClubsPage() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get("/clubs");
        setClubs(response.data);
      } catch (error) {
        console.error("Could not fetch clubs", error);
      }
    };

    fetchClubs();
  }, []);

  return (
    <section>
      <div className="hero-banner club-hero">
        <div>
          
          <h1>About the Clubs </h1>
          
        </div>
      </div>

      <div className="page-grid">
        {clubs.map((club) => (
          <section className="card interactive-card" key={club.id}>
            <h2>{club.name}</h2>
            <p><strong>Description:</strong> {club.description || "No description yet."}</p>
            <p><strong>About Us:</strong> {club.about_us || "Club coordinator has not updated this section yet."}</p>
          </section>
        ))}
      </div>
    </section>
  );
}

export default ClubsPage;
