import mongoose from "mongoose";

const ITRecruitmentSchema = new mongoose.Schema({
  technologies: [{
    category: { type: String, required: true },
    items: [{ type: String }] // Array of strings like ["React", "Node"]
  }],
  roles: [{
    title: { type: String, required: true },
    description: { type: String },
    skills: [{ type: String }],
    color: { type: String, default: "from-blue-500 to-cyan-500" },
    icon: { type: String, default: "Code2" } // We will store the icon name string
  }],
  industries: [{
    name: { type: String, required: true },
    count: { type: String }
  }],
  process: [{
    step: { type: String, required: true },
    title: { type: String },
    description: { type: String }
  }]
}, { timestamps: true });

// We only need one document for this page, so we don't really need complex IDs
export default mongoose.model("ITRecruitment", ITRecruitmentSchema);