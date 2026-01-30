import express from "express";
import NonITRole from "../models/NonITRole.js";

const router = express.Router();

// @desc    Get all roles (Public)
// @route   GET /api/non-it-roles
router.get("/", async (req, res) => {
  try {
    const roles = await NonITRole.find().sort({ createdAt: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new role (Admin)
// @route   POST /api/non-it-roles
router.post("/", async (req, res) => {
  try {
    const { title, description, positions, icon, color, image } = req.body;
    
    const newRole = new NonITRole({
      title,
      description,
      positions, // Expecting an array
      icon,
      color,
      image,
    });

    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a role (Admin)
// @route   DELETE /api/non-it-roles/:id
router.delete("/:id", async (req, res) => {
  try {
    await NonITRole.findByIdAndDelete(req.params.id);
    res.json({ message: "Role removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;