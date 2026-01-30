import mongoose from "mongoose";

const employerRequirementSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    positions: {
      type: String, // String allows for "5" or "5-10"
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    requirements: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmployerRequirement", employerRequirementSchema);