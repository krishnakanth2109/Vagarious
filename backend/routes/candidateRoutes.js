import express from "express";
import Candidate from "../models/Candidate.js";

const router = express.Router();

// @route   POST /api/candidates
// @desc    Submit a new candidate profile
router.post("/", async (req, res) => {
  try {
    const { 
      name, email, phone, experience, currentCompany, 
      currentRole, skills, preferredLocation, noticePeriod, message 
    } = req.body;

    // Convert comma-separated skills string to Array
    const skillsArray = Array.isArray(skills) 
      ? skills 
      : skills.split(',').map(skill => skill.trim());

    const newCandidate = new Candidate({
      name,
      email,
      phone,
      experience,
      currentCompany,
      currentRole,
      skills: skillsArray,
      preferredLocation,
      noticePeriod,
      message
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json({ message: "Profile submitted successfully", candidate: savedCandidate });
  } catch (error) {
    console.error("Error saving candidate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/candidates
// @desc    Get all candidates (For Admin Dashboard later)
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ submittedAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;