const express = require("express");
const { getEvents, getSingleEvent, addEvent, registerForEvent, removeEvent, scanEventRegistration } = require("../controllers/eventController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/scan/:token", scanEventRegistration);
router.get("/:id", getSingleEvent);
router.post(
  "/",
  verifyToken,
  allowRoles("club_coordinator", "department_coordinator"),
  upload.single("poster"),
  addEvent
);
router.delete("/:id", verifyToken, allowRoles("club_coordinator", "department_coordinator"), removeEvent);
router.post("/register", verifyToken, allowRoles("student"), registerForEvent);

module.exports = router;
