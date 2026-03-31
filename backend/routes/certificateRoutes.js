const express = require("express");
const { createCertificate } = require("../controllers/certificateController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, allowRoles("department_coordinator"), createCertificate);

module.exports = router;
