import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ===============================
   SMTP CONFIG (GMAIL – FIXED)
   =============================== */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",     // DO NOT use `service`
  port: 587,
  secure: false,              // TLS
  family: 4,                  // ✅ FORCE IPv4 (IMPORTANT)
  connectionTimeout: 60000,   // 60s
  greetingTimeout: 30000,
  socketTimeout: 60000,
  auth: {
    user: process.env.EMAIL_USER, // full gmail
    pass: process.env.EMAIL_PASS, // 16-char app password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP once on startup
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err);
  } else {
    console.log("✅ SMTP READY (Gmail IPv4 connected)");
  }
});

/* ===============================
   1. LOGIN
   =============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: { email: admin.email, id: admin._id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   2. FORGOT PASSWORD (SEND OTP)
   =============================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    const mailOptions = {
      from: `"VGS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vagarious Solutions - Password Reset OTP",
      html: `
        <div style="font-family:Arial;padding:20px;max-width:600px;margin:auto">
          <h2>Password Reset OTP</h2>
          <p>Your OTP:</p>
          <h1 style="letter-spacing:5px">${otp}</h1>
          <p>Valid for 10 minutes.</p>
        </div>
      `,
    };

    // Respond fast
    res.json({ message: "OTP sent successfully" });

    // Send mail async
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Mail accepted:", info.accepted);

  } catch (err) {
    console.error("❌ OTP SEND ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ===============================
   3. RESET PASSWORD
   =============================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!admin) return res.status(400).json({ message: "Invalid or expired OTP" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   4. SEED ADMIN (OPTIONAL)
   =============================== */
router.post("/seed", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });

    await newAdmin.save();
    res.json({ message: "Admin seeded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
