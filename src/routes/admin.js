const express = require("express");
const { createAdmin } = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/admin");
const router = express.Router();

router.post("/create", isAdmin, createAdmin);

module.exports = router;
