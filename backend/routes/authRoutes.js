import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ===============================
   SMTP CONFIG (GMAIL)
   =============================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
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
    admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await admin.save();

    const mailOptions = {
      from: `"VGS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is: ${otp}</h3>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
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

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   4. CHANGE PASSWORD (LOGGED IN)
   =============================== */
router.put("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    console.log("Change password request:", { email, hasCurrentPwd: !!currentPassword, hasNewPwd: !!newPassword });

    // 1. Find Admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Admin not found:", email);
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      console.log("Current password mismatch for:", email);
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 3. Hash and Save New Password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    console.log("Password updated successfully for:", email);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   5. SEED ADMIN
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