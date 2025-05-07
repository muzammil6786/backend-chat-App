const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth"); // correct path to auth.js
const Group = require("../models/Group");

// Make sure this route uses `auth` middleware
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id; // 🔐 Only works if middleware is OK
    let repeatedName = await Group.findOne({ name });
    if (repeatedName) {
      res.send({
        msg: "group name already exists please choose a different name",
      });
    }

    const group = new Group({
      name,
      members: [userId],
    });

    await group.save();
    res.json({ message: "group created successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

// POST /api/group/join
router.post("/join", auth, async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json({ message: "Joined group successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining group", error: error.message });
  }
});

module.exports = router;
