const mongoose = require("mongoose")

const syllabusSchema = mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, "Please Provide Semester Number"],
    },
    department: {
      type: String,
      required: [true, "Please Provide Department Name"],
    },
    subject: {
      type: String,
      required: [true, "Please Provide Subject Name"],
      trim: true,
    },
    file: {
      avatar: {
        type: String,
        required: true,
      },
      cloudinary_id: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
)

const SyllabusData = new mongoose.model("syllabusdata", syllabusSchema)

module.exports = SyllabusData
