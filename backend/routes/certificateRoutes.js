const express = require("express");
const { getCertificateOptions, createCertificate } = require("../controllers/certificateController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/options", verifyToken, allowRoles("department_coordinator"), getCertificateOptions);
router.post("/", verifyToken, allowRoles("department_coordinator"), createCertificate);

module.exports = router;
