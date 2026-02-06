import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js"; // Importing the updated Admin model
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// --- NODEMAILER CONFIGURATION ---
// Go to Google Account > Security > 2-Step Verification > App Passwords to get this password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// --- 1. LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ 
      message: "Login successful", 
      user: { email: admin.email, id: admin._id } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 2. FORGOT PASSWORD (GENERATE & SEND OTP) ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin email not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and Expiry (10 mins from now)
    admin.otp = otp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000; 
    await admin.save();

    // Email Content
    const mailOptions = {
      from: `"VGS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vagarious Solutions - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">You requested a password reset for your admin account. Please use the OTP below to verify your identity.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ffffff; background-color: #4f46e5; padding: 15px 30px; border-radius: 5px;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// --- 3. RESET PASSWORD (VERIFY OTP) ---
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Find admin with matching Email AND OTP, and check if OTP hasn't expired
    const admin = await Admin.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!admin) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update Admin record
    admin.password = hashedPassword;
    admin.otp = null;      // Clear OTP
    admin.otpExpires = null; // Clear Expiry
    await admin.save();

    res.json({ message: "Password has been reset successfully. Please login." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 4. SEED ADMIN (Optional: To create the first admin via Postman) ---
router.post("/seed", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if(existing) return res.status(400).json({message: "Admin exists"});

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();
    res.json({ message: "Admin seeded successfully" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
