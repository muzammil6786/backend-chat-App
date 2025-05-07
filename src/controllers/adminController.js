const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async (req, res) => {
  try {
    const { name, firstName, email, password } = req.body;

    if (!name || !firstName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      firstName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true, // Admins are auto-verified
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        firstName: admin.firstName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createAdmin };
