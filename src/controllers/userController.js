const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");
const { default: mongoose } = require("mongoose");

const signup = async (req, res) => {
  const { name, firstName, email, country, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let emailExist = await User.findOne({ email });
  if (emailExist) {
    res.send({ msg: "email already exists" });
  }
  const user = await User.create({
    name,
    firstName,
    email,
    country,
    password: hashedPassword,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  await sendEmail(
    email,
    `Verify using this link: http://localhost:5000/api/user/verify/${token}`
  );
  res.json({ message: "Signup successful, check your email to verify." });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  await User.findByIdAndUpdate(id, { isVerified: true });
  res.json({ message: "Email verified successfully." });
};

module.exports = { signup, verifyEmail };
