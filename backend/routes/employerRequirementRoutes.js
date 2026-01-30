import express from "express";
import EmployerRequirement from "../models/EmployerRequirement.js";

const router = express.Router();

/* =====================================================
   CONTROLLER LOGIC
===================================================== */

// @desc    Submit a new hiring requirement
// @route   POST /api/employer-requirements
// @access  Public
const createRequirement = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      positions,
      location,
      requirements,
    } = req.body;

    // Basic Validation
    if (!companyName || !contactPerson || !email || !phone || !requirements) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const newRequirement = new EmployerRequirement({
      companyName,
      contactPerson,
      email,
      phone,
      positions,
      location,
      requirements,
    });

    const savedRequirement = await newRequirement.save();

    res.status(201).json({
      success: true,
      message: "Requirement submitted successfully",
      data: savedRequirement,
    });
  } catch (error) {
    console.error("Error creating employer requirement:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all hiring requirements (For Admin)
// @route   GET /api/employer-requirements
// @access  Private/Admin
const getAllRequirements = async (req, res) => {
  try {
    // Sort by newest first
    const requirements = await EmployerRequirement.find().sort({ createdAt: -1 });
    res.status(200).json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update status (Pending -> Contacted -> Closed)
// @route   PUT /api/employer-requirements/:id
const updateRequirementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status enum if needed, or rely on Mongoose enum validation
    
    const requirement = await EmployerRequirement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );

    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    res.status(200).json(requirement);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ROUTE DEFINITIONS
===================================================== */

// Route to submit form (Public)
router.post("/", createRequirement);

// Route to get list (Admin)
router.get("/", getAllRequirements);

// Route to update status
router.put("/:id", updateRequirementStatus);

export default router;