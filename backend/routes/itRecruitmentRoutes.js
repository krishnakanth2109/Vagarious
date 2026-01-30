import express from "express";
import ITRecruitment from "../models/ITRecruitment.js";

const router = express.Router();

// GET Content
router.get("/", async (req, res) => {
  try {
    // Find the first (and usually only) document
    let data = await ITRecruitment.findOne();
    
    // If no data exists yet, return empty structure or create default
    if (!data) {
        data = new ITRecruitment({ technologies: [], roles: [], industries: [], process: [] });
        await data.save();
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE Content (Replaces the arrays)
router.put("/", async (req, res) => {
  try {
    const { technologies, roles, industries, process } = req.body;
    
    // Find one and update, or create if not exists (upsert)
    const data = await ITRecruitment.findOneAndUpdate(
      {}, 
      { technologies, roles, industries, process },
      { new: true, upsert: true } // upsert creates it if it doesn't exist
    );
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;