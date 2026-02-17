import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a new contact form message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    const savedContact = await newContact.save();
    res.status(201).json({ message: "Message sent successfully", contact: savedContact });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/contact
// @desc    Get all messages (For Admin Dashboard)
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ submittedAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;