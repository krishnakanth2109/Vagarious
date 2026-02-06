import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ===============================
   SMTP CONFIG (GMAIL — FIXED)
   =============================== */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // 16-char App Password
  },
  family: 4, // ✅ FORCE IPv4 (CRITICAL FIX FOR RENDER)
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP on boot
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err);
  } else {
    console.log("✅ SMTP READY (Gmail connected via IPv4)");
  }
});

/* ===============================
   LOGIN
   =============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   FORGOT PASSWORD (SEND OTP)
   =============================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    const mailOptions = {
      from: `"VGS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial; padding: 20px">
          <h2>Password Reset OTP</h2>
          <p>Your OTP:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>Valid for 10 minutes.</p>
        </div>
      `,
    };

    // 🚀 Respond immediately (fast API)
    res.json({ message: "OTP sent successfully" });

    // 📧 Send email in background
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("📧 OTP mail sent:", info.accepted);
      })
      .catch((err) => {
        console.error("❌ MAIL SEND FAILED:", err);
      });

  } catch (err) {
    console.error("❌ OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ===============================
   RESET PASSWORD
   =============================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   SEED ADMIN (OPTIONAL)
   =============================== */
router.post("/seed", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      email,
      password: await bcrypt.hash(password, 10),
    });

    await admin.save();
    res.json({ message: "Admin created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
