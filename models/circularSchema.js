const mongoose = require("mongoose")

const circularSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Provide A Name"],
      trim: true,
    },
    image: {
      avatar: {
        type: String,
        required: true,
      },
      cloudinary_id: {
        type: String,
        required: true,
      },
    },
    for: {
      type: String,
      default: "all",
    },
  },
  { timestamps: true }
)

const CircularData = new mongoose.model("circulardata", circularSchema)

module.exports = CircularData
