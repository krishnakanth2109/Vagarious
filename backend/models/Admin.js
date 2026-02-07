import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // New fields for OTP functionality
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  }
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;