import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js"; // Ensure this path matches your file structure

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing from .env file");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2. Define Admin Credentials
    const email = "career.arahinfotech@gmail.com";
    const password = "Vgs@2026";

    // 3. Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash(password, 10);
      existingAdmin.password = hashedPassword;
      // Reset OTP fields just in case
      existingAdmin.otp = null;
      existingAdmin.otpExpires = null;
      
      await existingAdmin.save();
      console.log(`♻️  Admin found. Password updated for: ${email}`);
    } else {
      // Create new Admin
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newAdmin = new Admin({
        email,
        password: hashedPassword,
        otp: null,
        otpExpires: null
      });

      await newAdmin.save();
      console.log(`🎉 Admin created successfully: ${email}`);
    }

  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  } finally {
    // 4. Close Connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit();
  }
};

// Run the function
seedAdmin();