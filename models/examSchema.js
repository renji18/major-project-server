const mongoose = require("mongoose")

const examSchema = mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, "Please Provide Semester Number"],
    },
    department: {
      type: String,
      required: [true, "Please Provide Department Name"],
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
      exam_type: {
        type: String,
        required: [true, "Please Provide Exam Type"],
      },
    },
  },
  { timestamps: true }
)

const ExamData = new mongoose.model("examdata", examSchema)

module.exports = ExamData
