const express = require("express");
const {
  applyVolunteer,
  getVolunteerRequests,
  changeVolunteerStatus
} = require("../controllers/volunteerController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", verifyToken, allowRoles("student"), applyVolunteer);
router.get("/requests", verifyToken, allowRoles("club_coordinator", "department_coordinator"), getVolunteerRequests);
router.patch("/:id/status", verifyToken, allowRoles("club_coordinator", "department_coordinator"), changeVolunteerStatus);

module.exports = router;
