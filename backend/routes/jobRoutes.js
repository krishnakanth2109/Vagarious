import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ postedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
router.post("/", async (req, res) => {
  try {
    const { title, company, location, type, experience, skills, description } = req.body;

    // Handle skills if sent as string "React, Node" vs Array
    const skillsArray = Array.isArray(skills) 
      ? skills 
      : skills.split(',').map(skill => skill.trim());

    const newJob = new Job({
      title,
      company,
      location,
      type,
      experience,
      skills: skillsArray,
      description
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: "Error saving job", error: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
router.delete("/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job" });
  }
});

export default router;