const express = require("express");
const { getDepartments, getSingleDepartment, editDepartmentProfile } = require("../controllers/departmentController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getDepartments);
router.get("/:id", getSingleDepartment);
router.put("/:id", verifyToken, allowRoles("department_coordinator"), editDepartmentProfile);

module.exports = router;
