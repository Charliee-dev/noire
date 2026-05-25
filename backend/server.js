const helmet = require("helmet");

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const seedProducts = require("./seedProducts");
console.log("🔥 THIS SERVER IS RUNNING ON 5001");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");


const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
const PORT = 5001;

const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://charliee-dev.github.io"
];

app.use(cors({
  origin: function(origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("CORS not allowed")
    );
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// ===============================
// 🔌 MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // await seedProducts();// ✅ permanent automatic seeding

  })
  .catch(err => console.log(err));

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    success:false,
    message:"Invalid email"
  });
}


   if (
  !email ||
  !password ||
  password.length < 8
) {
  return res.status(400).json({
    success:false,
    message:"Password must be at least 8 characters"
  });
}

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
  email,
  password: hashed,
  role: "user" // ✅ ADD THIS
});
    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

   const token = jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.json({ success: true, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

function authMiddleware(req, res, next) {
 const header = req.headers.authorization;

if (!header || !header.startsWith("Bearer ")) {
  return res.status(401).json({
  success: false,
  message: "Unauthorized"
});
}

const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
  return res.status(401).json({
    success: false,
    message: "Invalid token"
  });
}
}
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
}


// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});