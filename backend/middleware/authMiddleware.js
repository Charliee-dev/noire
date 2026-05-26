const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 🔐 VERIFY TOKEN
exports.authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
} catch (err) {
  console.error(err);
  return res.status(401).json({
    message: "Invalid token"
  });
}
};

// 🔒 ADMIN CHECK
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};