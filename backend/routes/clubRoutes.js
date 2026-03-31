const express = require("express");
const {
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
} = require("../controllers/clubController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/recruitment", getRecruitments);
router.get("/recruitment/manage", verifyToken, allowRoles("club_coordinator"), getClubRecruitments);
router.post("/recruitment/:id/apply", verifyToken, allowRoles("student"), submitRecruitmentApplication);
router.get("/recruitment/applications", verifyToken, allowRoles("club_coordinator"), getRecruitmentApplications);
router.patch("/recruitment/applications/:id/status", verifyToken, allowRoles("club_coordinator"), changeRecruitmentApplicationStatus);
router.delete("/recruitment/:id", verifyToken, allowRoles("club_coordinator"), removeClubRecruitment);
router.get("/", getClubs);
router.get("/:id", getSingleClub);
router.put("/:id", verifyToken, allowRoles("club_coordinator"), editClubProfile);
router.post(
  "/recruitment",
  verifyToken,
  allowRoles("club_coordinator"),
  createClubRecruitment
);

module.exports = router;
