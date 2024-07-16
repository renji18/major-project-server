const mongoose = require("mongoose")

const syllabusSchema = mongoose.Schema(
  {
    for: {
      type: Number,
      required: [true, "Please Provide Semester Number"],
    },
    name: {
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
