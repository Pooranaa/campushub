const express = require("express");
const { getProfile, getDashboard } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;
