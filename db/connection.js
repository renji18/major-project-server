const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

const connectDB = (URL) => {
  return mongoose.connect(URL)
}

module.exports = connectDB
