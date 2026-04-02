const express = require("express");
const { sendVerificationCode, register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/send-verification-code", sendVerificationCode);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
