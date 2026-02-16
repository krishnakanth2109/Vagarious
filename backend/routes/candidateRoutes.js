import express from "express";
import Candidate from "../models/Candidate.js";

const router = express.Router();

// @route   POST /api/candidates
// @desc    Submit a new candidate profile
router.post("/", async (req, res) => {
  try {
    const { 
      name, email, phone, experience, currentCompany, 
      currentRole, appliedJob, skills, preferredLocation, noticePeriod, message 
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
      appliedJob: appliedJob || "General Application", // Default if empty
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
// @desc    Get all candidates
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ submittedAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// @route   PUT /api/candidates/:id
// @desc    Update candidate profile
router.put("/:id", async (req, res) => {
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Return updated doc
    );
    res.status(200).json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: "Error updating candidate", error: error.message });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate profile
router.delete("/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate" });
  }
});
export default router;