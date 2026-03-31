import React, { useEffect, useState } from "react";
import api from "../services/api";

function ClubRecruitmentPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isStudent = user.role === "student";
  const [recruitments, setRecruitments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    questionsText: "Why do you want to join?\nWhat skills can you contribute?"
  });
  const [answersMap, setAnswersMap] = useState({});
  const [message, setMessage] = useState("");

  const loadRecruitmentData = async () => {
    try {
      const recruitmentResponse = await api.get("/clubs/recruitment");
      setRecruitments(recruitmentResponse.data);

      if (!isStudent) {
        const applicationResponse = await api.get("/clubs/recruitment/applications");
        setApplications(applicationResponse.data);
      }
    } catch (error) {
      console.error("Could not load recruitment data", error);
    }
  };

  useEffect(() => {
    loadRecruitmentData();
  }, []);

  const handleCoordinatorSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/clubs/recruitment", {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        questions: formData.questionsText.split("\n").map((item) => item.trim()).filter(Boolean)
      });
      setMessage(response.data.message);
      setFormData({
        title: "",
        description: "",
        deadline: "",
        questionsText: "Why do you want to join?\nWhat skills can you contribute?"
      });
      loadRecruitmentData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create recruitment");
    }
  };

  const handleStudentAnswerChange = (recruitmentId, questionKey, value) => {
    setAnswersMap((previous) => ({
      ...previous,
      [recruitmentId]: {
        ...(previous[recruitmentId] || {}),
        [questionKey]: value
      }
    }));
  };

  const handleStudentApply = async (recruitmentId, questions) => {
    try {
      const answers = [
        {
          question: "Area of interest",
          answer: answersMap[recruitmentId]?.interest || ""
        },
        {
          question: "Skills",
          answer: answersMap[recruitmentId]?.skills || ""
        },
        {
          question: "Previous experience",
          answer: answersMap[recruitmentId]?.experience || ""
        },
        {
          question: "Why do you want to join?",
          answer: answersMap[recruitmentId]?.motivation || ""
        },
        {
          question: "Availability",
          answer: answersMap[recruitmentId]?.availability || ""
        },
        ...questions.map((question, index) => ({
          question,
          answer: answersMap[recruitmentId]?.[`custom_${index}`] || ""
        }))
      ];

      const response = await api.post(`/clubs/recruitment/${recruitmentId}/apply`, { answers });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not submit application");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.patch(`/clubs/recruitment/applications/${applicationId}/status`, { status });
      setMessage(`Application ${status}.`);
      loadRecruitmentData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update application");
    }
  };

  if (isStudent) {
    return (
      <section>
        <div className="hero-banner club-hero">
          <div>
            <p className="hero-tag">Ongoing Recruitments</p>
            <h1>Apply to clubs that are currently welcoming new members.</h1>
            <p className="hero-copy">Fill out the interest form and the respective club coordinator will review your application.</p>
          </div>
        </div>

        {message && <p>{message}</p>}

        <div className="page-grid">
          {recruitments.map((item) => (
            <section className="card interactive-card" key={item.id}>
              <p className="panel-tag">{item.club_name}</p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <p><strong>Apply before:</strong> {new Date(item.deadline).toLocaleString()}</p>

              <div className="form">
                <div>
                  <label className="input-label">Area of interest *</label>
                  <input
                    placeholder="Example: Content, Design, Events, Technical"
                    value={answersMap[item.id]?.interest || ""}
                    onChange={(event) => handleStudentAnswerChange(item.id, "interest", event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Skills</label>
                  <textarea
                    placeholder="Mention your technical, creative, communication, or leadership skills"
                    value={answersMap[item.id]?.skills || ""}
                    onChange={(event) => handleStudentAnswerChange(item.id, "skills", event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Previous experience</label>
                  <textarea
                    placeholder="Mention projects, events, volunteering, or prior club work"
                    value={answersMap[item.id]?.experience || ""}
                    onChange={(event) => handleStudentAnswerChange(item.id, "experience", event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Why do you want to join? *</label>
                  <textarea
                    placeholder="Tell the club why you are interested and how you want to contribute"
                    value={answersMap[item.id]?.motivation || ""}
                    onChange={(event) => handleStudentAnswerChange(item.id, "motivation", event.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Availability</label>
                  <input
                    placeholder="Example: Weekdays after 4 PM"
                    value={answersMap[item.id]?.availability || ""}
                    onChange={(event) => handleStudentAnswerChange(item.id, "availability", event.target.value)}
                  />
                </div>
                {item.questions.map((question, index) => (
                  <div key={`${item.id}-${index}`}>
                    <label className="input-label">{question}</label>
                    <textarea
                      placeholder="Write your answer here"
                      value={answersMap[item.id]?.[`custom_${index}`] || ""}
                      onChange={(event) => handleStudentAnswerChange(item.id, `custom_${index}`, event.target.value)}
                    />
                  </div>
                ))}
                <p className="muted-text">
                  Clubs can use your interests, motivation, skills, and experience to shortlist applicants.
                </p>
                <button type="button" onClick={() => handleStudentApply(item.id, item.questions)}>
                  Submit Application
                </button>
              </div>
            </section>
          ))}
          {!recruitments.length && <div className="card"><p>No ongoing recruitments right now.</p></div>}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="hero-banner club-hero">
        <div>
          <p className="hero-tag">Recruitment Management</p>
          <h1>Create recruitments and review student applications in one place.</h1>
          <p className="hero-copy">Students can now see ongoing recruitments and submit interest forms directly.</p>
        </div>
      </div>

      {message && <p>{message}</p>}

      <div className="page-grid dashboard-grid">
        <section className="card">
          <h2>Create Recruitment</h2>
          <form onSubmit={handleCoordinatorSubmit} className="form">
            <input type="text" placeholder="Recruitment Title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
            <textarea placeholder="Description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            <label className="input-label">Recruitment deadline</label>
            <input type="datetime-local" value={formData.deadline} onChange={(event) => setFormData({ ...formData, deadline: event.target.value })} />
            <label className="input-label">Questions for applicants</label>
            <textarea placeholder="One question per line" value={formData.questionsText} onChange={(event) => setFormData({ ...formData, questionsText: event.target.value })} />
            <button type="submit">Create Recruitment</button>
          </form>
        </section>

        <section className="card">
          <h2>Student Applications</h2>
          <div className="dashboard-list">
            {applications.map((application) => (
              <div className="list-row column-row" key={application.id}>
                <div>
                  <h3>{application.student_name}</h3>
                  <p>{application.title}</p>
                  <p>Status: {application.status}</p>
                  {application.answers.map((entry, index) => (
                    <p key={`${application.id}-${index}`}>
                      <strong>{entry.question}:</strong> {entry.answer}
                    </p>
                  ))}
                </div>
                <div className="action-row">
                  <button type="button" onClick={() => updateApplicationStatus(application.id, "shortlisted")}>
                    Shortlist
                  </button>
                  <button type="button" onClick={() => updateApplicationStatus(application.id, "accepted")}>
                    Accept
                  </button>
                  <button type="button" className="secondary-button" onClick={() => updateApplicationStatus(application.id, "rejected")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!applications.length && <p>No student applications yet.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default ClubRecruitmentPage;
