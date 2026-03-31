import React, { useEffect, useState } from "react";
import api from "../services/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Could not fetch profile", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className="card">
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      {profile.organization_name && <p><strong>Organization:</strong> {profile.organization_name}</p>}
      <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
    </section>
  );
}

export default ProfilePage;
