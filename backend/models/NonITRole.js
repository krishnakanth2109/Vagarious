import mongoose from "mongoose";

const nonITRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Array of strings for specific job titles
    positions: {
      type: [String], 
      required: true,
    },
    // Store the Lucide React Icon name (e.g., "BarChart3")
    icon: {
      type: String,
      required: true, 
    },
    // Store the gradient color class (e.g., "from-blue-500 to-cyan-500")
    color: {
      type: String,
      default: "from-gray-500 to-slate-500",
    },
    // Image URL (optional, as per your request)
    image: {
      type: String, 
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("NonITRole", nonITRoleSchema);