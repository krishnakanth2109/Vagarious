import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  currentCompany: { type: String },
  currentRole: { type: String },
  skills: { type: [String], required: true }, // Stored as array
  preferredLocation: { type: String },
  noticePeriod: { type: String },
  message: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Candidate", candidateSchema);