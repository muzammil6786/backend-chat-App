const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "No token" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (user?.role !== "admin")
    return res.status(403).json({ error: "Admin only" });
  next();
};

module.exports = { isAdmin };
