const StudentData = require("../models/studentSchema")
const CircularData = require("../models/circularSchema")
const xlsx = require("xlsx")
const nodemailer = require("nodemailer")
const cloudinary = require("cloudinary").v2

// overwrite the previous students data and replace with the new one
const addStudents = async (req, res, next) => {
  try {
    if (!req.files.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const workbook = xlsx.read(req.files.file.data, { type: "buffer" })
    let data = []

    const sheets = workbook.SheetNames
    for (let i = 0; i < sheets.length; i++) {
      const temp = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[i]]
      )
      data.push(...temp)
    }

    data = data?.map((d) => {
      return {
        name: d?.Name,
        enrollment: d["Enrollment Number"],
        contact: d?.Contact,
        email: d?.Email,
        division: d?.Division,
        fees: {
          tuition: {
            total: d["Total Tuition Fees"],
            paid: d["Paid Tuition Fees"],
            pending: d["Pending Tuition Fees"],
          },
          hostel: {
            total: d["Total Hostel Fees"],
            paid: d["Paid Hostel Fees"],
            pending: d["Pending Hostel Fees"],
          },
          bus: {
            total: d["Total Bus Fees"],
            paid: d["Paid Bus Fees"],
            pending: d["Pending Bus Fees"],
          },
        },
      }
    })

    await StudentData.deleteMany()

    await StudentData.create(data)

    res.status(201).json({ message: "Success" })
  } catch (error) {
    res.status(500).json({ message: "Failed adding students", error })
  }
}

// appends the new students data after the previous uploaded data
const appendNewStudents = async (req, res, next) => {
  try {
    if (!req.files.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const workbook = xlsx.read(req.files.file.data, { type: "buffer" })
    let data = []

    const sheets = workbook.SheetNames
    for (let i = 0; i < sheets.length; i++) {
      const temp = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[i]]
      )
      data.push(...temp)
    }

    data = data?.map((d) => {
      return {
        name: d?.Name,
        enrollment: d["Enrollment Number"],
        contact: d?.Contact,
        email: d?.Email,
        division: d?.Division,
        fees: {
          tuition: {
            total: d["Total Tuition Fees"],
            paid: d["Paid Tuition Fees"],
            pending: d["Pending Tuition Fees"],
          },
          hostel: {
            total: d["Total Hostel Fees"],
            paid: d["Paid Hostel Fees"],
            pending: d["Pending Hostel Fees"],
          },
          bus: {
            total: d["Total Bus Fees"],
            paid: d["Paid Bus Fees"],
            pending: d["Pending Bus Fees"],
          },
        },
      }
    })

    await StudentData.create(data)

    res.status(201).json({ message: "Success" })
  } catch (error) {
    res.status(500).json({ message: "Failed appending students", error })
  }
}

// get all students data
const getAllStudentsData = async (req, res, next) => {
  try {
    const students = await StudentData.find()
    res.status(201).json({ message: "Success", students })
  } catch (error) {
    res.status(500).json({ message: "Failed getting all students", error })
  }
}

// get single student data
const getSingleStudentData = async (req, res, next) => {
  try {
    const student = await StudentData.findOne({
      enrollment: req.params.enrollmentId,
    })
    res.status(201).json({ message: "Success", student })
  } catch (error) {
    res.status(500).json({ message: "Failed getting single students", error })
  }
}

// sending email to students
const sendMailToStudents = async (req, res, next) => {
  const { students } = req.body
  const { feesType } = req.params
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })
    const mailOptions = {
      from: `${process.env.SMTP_NAME} ${process.env.SMTP_MAIL}`,
      subject: `${
        feesType.charAt(0).toUpperCase() + feesType.slice(1)
      } fees pending`,
    }

    students?.map(async (s) => {
      mailOptions.to = s?.email
      mailOptions.html = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
      <div>
        <p>Dear ${s?.name},</p>
        <p>This is to kindly inform you that your <strong>fees for ${feesType}</strong> is pending by <strong>₹${
        s?.fees[feesType]?.pending || 0
      }</strong></p>
        <p>Pay the fees before the last date to avoid any inconvenience. Please ignore if already paid.</p>
        <br/>
        <p>Thank You,</p>
        <p>Aadarsh University</p>
      </div>
      </body>
      </html>
    `
      await transporter.sendMail(mailOptions)
    })

    res.status(201).json({ message: "Success" })
  } catch (error) {
    res.status(500).json({ message: "Failed sending email", error })
  }
}

// create circular
const createCircular = async (req, res, next) => {
  try {
    const { circular } = req.files
    const { name, by } = req.body

    const buffer = circular.data

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "circulars" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file" })
        } else {
          const newCircular = new CircularData({
            by,
            name,
            image: {
              avatar: result.secure_url,
              cloudinary_id: result.public_id,
            },
          })
          await newCircular.save()
          return res.status(201).json({
            message: "File uploaded successfully!",
            data: newCircular,
          })
        }
      }
    )

    uploadStream.end(buffer)
  } catch (error) {
    res.status(500).json({ message: "Failed to save circular", error })
  }
}

// read single circular
const singleCircular = async (req, res, next) => {
  try {
    const circular = await CircularData.findById(req.params._id)
    res.status(201).json({
      message: "success",
      data: circular,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to save circular", error })
  }
}

// read all circulars
const allCirculars = async (req, res, next) => {
  try {
    const circulars = await CircularData.find()
    res.status(201).json({
      message: "success",
      data: circulars,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get circulars", error })
  }
}

// edit circular
const editCircular = async (req, res, next) => {
  try {
    await CircularData.findByIdAndUpdate(req.params._id, req.body)
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to edit circular", error })
  }
}

// delete circular
const deleteCircular = async (req, res, next) => {
  try {
    const circular = await CircularData.findById(req.params._id)
    await cloudinary.uploader.destroy(
      circular.image.cloudinary_id,
      function (result) {
        console.log(result, "log from erore")
      }
    )
    await circular.deleteOne({ _id: req.params._id })
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete circular", error })
  }
}

module.exports = {
  addStudents,
  appendNewStudents,
  getAllStudentsData,
  getSingleStudentData,
  sendMailToStudents,
  createCircular,
  allCirculars,
  singleCircular,
  deleteCircular,
  editCircular,
}
