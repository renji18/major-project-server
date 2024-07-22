const mongoose = require("mongoose")

const achievementSchema = mongoose.Schema(
  {
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

const AchievementData = new mongoose.model("achievementdata", achievementSchema)

module.exports = AchievementData
