import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ===============================
   NODEMAILER SMTP CONFIGURATION
   =============================== */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // gmail APP PASSWORD
  },
});

// Verify SMTP once at startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/* ===============================
   1. LOGIN
   =============================== */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
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
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin email not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP & expiry (10 minutes)
    admin.otp = otp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    const mailOptions = {
      from: `"VGS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vagarious Solutions - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #4f46e5; text-align: center;">Password Reset OTP</h2>
          <p>Hello,</p>
          <p>Please use the OTP below to reset your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #fff; background: #4f46e5; padding: 12px 25px; border-radius: 6px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #666; text-align: center;">
            This OTP will expire in 10 minutes.
          </p>
        </div>
      `,
    };

    // Respond immediately (FAST)
    res.json({ message: "OTP sent successfully" });

    // Send email in background (IMPORTANT)
    transporter.sendMail(mailOptions)
      .then(() => console.log(`✅ OTP email sent to ${email}`))
      .catch(err => console.error("❌ Email send error:", err));

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ===============================
   3. RESET PASSWORD (VERIFY OTP)
   =============================== */

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
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
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });

    await newAdmin.save();
    res.json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
