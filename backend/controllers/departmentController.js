const { getAllDepartments, getDepartmentById, updateDepartmentProfile } = require("../models/departmentModel");

const getDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch departments.", error: error.message });
  }
};

const getSingleDepartment = async (req, res) => {
  try {
    const department = await getDepartmentById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch department.", error: error.message });
  }
};

const editDepartmentProfile = async (req, res) => {
  try {
    const departmentId = req.user.role === "admin" ? req.params.id : req.user.department_id;

    await updateDepartmentProfile(departmentId, {
      description: req.body.description || "",
      about_us: req.body.about_us || ""
    });

    res.json({ message: "Department profile updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not update department profile.", error: error.message });
  }
};

module.exports = {
  getDepartments,
  getSingleDepartment,
  editDepartmentProfile
};
