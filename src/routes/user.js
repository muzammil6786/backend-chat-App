const express = require("express");
const { signup, verifyEmail } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signup);
router.get("/verify/:token", verifyEmail);

module.exports = router;
