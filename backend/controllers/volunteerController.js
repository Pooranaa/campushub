const {
  applyForVolunteerRole,
  getVolunteerRequestsForCoordinator,
  updateVolunteerStatus
} = require("../models/volunteerModel");

const applyVolunteer = async (req, res) => {
  try {
    const { event_id, preferred_role } = req.body;

    const result = await applyForVolunteerRole({
      event_id,
      student_id: req.user.id,
      preferred_role
    });

    res.status(201).json({
      message: "Volunteer application submitted.",
      applicationId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Could not apply for volunteer role.", error: error.message });
  }
};

const getVolunteerRequests = async (req, res) => {
  try {
    const relatedId = req.user.role === "club_coordinator" ? req.user.club_id : req.user.department_id;
    const requests = await getVolunteerRequestsForCoordinator(req.user.role, relatedId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch volunteer requests.", error: error.message });
  }
};

const changeVolunteerStatus = async (req, res) => {
  try {
    const { status, assigned_role } = req.body;

    await updateVolunteerStatus(req.params.id, status, assigned_role);

    res.json({ message: "Volunteer request updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not update volunteer request.", error: error.message });
  }
};

module.exports = {
  applyVolunteer,
  getVolunteerRequests,
  changeVolunteerStatus
};
