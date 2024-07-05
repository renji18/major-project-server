require("dotenv").config()
require("./cleanup")

const express = require("express")
const app = express()

const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary").v2

const connectDB = require("./db/connection")
const router = require("./routes/routing")

app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({ useTempFiles: true }))

app.use("/api", router)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI).then(() => {
      console.log("Connected to database")
      app.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}...`)
      })
    })
  } catch (error) {
    console.log("Database not connected")
  }
}

start()
