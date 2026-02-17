import express from "express";
import Candidate from "../models/Candidate.js";

const router = express.Router();

// @route   GET /api/candidates
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ submittedAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/candidates
router.post("/", async (req, res) => {
  try {
    const { skills, ...rest } = req.body;
    const skillsArray = Array.isArray(skills) 
      ? skills 
      : skills.split(',').map(skill => skill.trim());

    const newCandidate = new Candidate({ ...rest, skills: skillsArray });
    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    res.status(500).json({ message: "Error saving candidate", error: error.message });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate profile
router.put("/:id", async (req, res) => {
  try {
    const { skills, ...updateData } = req.body;
    
    // Ensure skills is always saved as an array in DB
    if (skills) {
      updateData.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim());
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true } 
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(updatedCandidate);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error updating candidate", error: error.message });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate profile
router.delete("/:id", async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!deletedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate" });
  }
});

export default router;