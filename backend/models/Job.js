import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
    default: "Full-time",
  },
  experience: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  }
});

const Job = mongoose.model("Job", jobSchema);
export default Job;