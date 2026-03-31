const {
  getAllClubs,
  getClubById,
  updateClubProfile,
  createRecruitment,
  getOpenRecruitments,
  getRecruitmentsByClub,
  applyToRecruitment,
  findRecruitmentApplication,
  getRecruitmentApplicationsForClub,
  updateRecruitmentApplicationStatus,
  getRecruitmentById,
  deleteRecruitmentById
} = require("../models/clubModel");

const getClubs = async (req, res) => {
  try {
    const clubs = await getAllClubs();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch clubs.", error: error.message });
  }
};

const getSingleClub = async (req, res) => {
  try {
    const club = await getClubById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch club.", error: error.message });
  }
};

const editClubProfile = async (req, res) => {
  try {
    const clubId = req.user.role === "admin" ? req.params.id : req.user.club_id;

    await updateClubProfile(clubId, {
      description: req.body.description || "",
      about_us: req.body.about_us || ""
    });

    res.json({ message: "Club profile updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not update club profile.", error: error.message });
  }
};

const createClubRecruitment = async (req, res) => {
  try {
    const { title, description, questions, deadline } = req.body;
    const clubCoordinatorId = req.user.club_id;

    if (!clubCoordinatorId) {
      return res.status(400).json({ message: "Club account not found." });
    }

    const result = await createRecruitment({
      club_coordinator_id: clubCoordinatorId,
      title,
      description,
      questions: JSON.stringify(questions || []),
      deadline
    });

    res.status(201).json({
      message: "Recruitment drive created successfully.",
      recruitmentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create recruitment.", error: error.message });
  }
};

const getRecruitments = async (req, res) => {
  try {
    const recruitments = await getOpenRecruitments();

    res.json(
      recruitments.map((item) => ({
        ...item,
        questions: item.questions ? JSON.parse(item.questions) : []
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Could not fetch recruitments.", error: error.message });
  }
};

const getClubRecruitments = async (req, res) => {
  try {
    const recruitments = await getRecruitmentsByClub(req.user.club_id);

    res.json(
      recruitments.map((item) => ({
        ...item,
        questions: item.questions ? JSON.parse(item.questions) : []
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Could not fetch club recruitments.", error: error.message });
  }
};

const submitRecruitmentApplication = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ message: "Please fill in the recruitment form before submitting." });
    }

    const existingApplication = await findRecruitmentApplication(req.params.id, req.user.id);
    if (existingApplication) {
      return res.status(409).json({
        message: `You have already applied for this recruitment. Current status: ${existingApplication.status}.`
      });
    }

    const result = await applyToRecruitment({
      club_recruitment_id: req.params.id,
      student_id: req.user.id,
      answers: JSON.stringify(answers)
    });

    res.status(201).json({
      message: "Recruitment application submitted successfully.",
      applicationId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Could not submit recruitment application.", error: error.message });
  }
};

const getRecruitmentApplications = async (req, res) => {
  try {
    const applications = await getRecruitmentApplicationsForClub(req.user.club_id);

    res.json(
      applications.map((item) => ({
        ...item,
        answers: item.answers ? JSON.parse(item.answers) : []
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Could not fetch recruitment applications.", error: error.message });
  }
};

const changeRecruitmentApplicationStatus = async (req, res) => {
  try {
    await updateRecruitmentApplicationStatus(req.params.id, req.body.status);
    res.json({ message: "Recruitment application updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not update recruitment application.", error: error.message });
  }
};

const removeClubRecruitment = async (req, res) => {
  try {
    const recruitment = await getRecruitmentById(req.params.id);

    if (!recruitment) {
      return res.status(404).json({ message: "Recruitment not found." });
    }

    if (req.user.role !== "admin" && Number(recruitment.club_coordinator_id) !== Number(req.user.club_id)) {
      return res.status(403).json({ message: "You do not have permission to delete this recruitment." });
    }

    await deleteRecruitmentById(req.params.id);
    res.json({ message: "Recruitment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete recruitment.", error: error.message });
  }
};

module.exports = {
  getClubs,
  getSingleClub,
  editClubProfile,
  createClubRecruitment,
  getRecruitments,
  getClubRecruitments,
  submitRecruitmentApplication,
  getRecruitmentApplications,
  changeRecruitmentApplicationStatus,
  removeClubRecruitment
};
