const User = require("../src/models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  const existing = await User.findOne({ email: "admin@chat.com" });
  if (!existing) {
    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      firstName: "Root",
      email: "admin@chat.com",
      password: hash,
      isVerified: true,
      role: "admin",
    });
  }
};

module.exports = { seedAdmin };
