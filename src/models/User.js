const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  email: { type: String, unique: true },
  password: String,
  country: String,
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

module.exports = mongoose.model("User", userSchema);
