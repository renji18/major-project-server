const StudentData = require("../models/studentSchema")
const CircularData = require("../models/circularSchema")
const xlsx = require("xlsx")
const nodemailer = require("nodemailer")
const SyllabusData = require("../models/syllabusSchema")
const ExamData = require("../models/examSchema")
const AchievementData = require("../models/achievementsSchema")
const cloudinary = require("cloudinary").v2

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

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

// get all students data
const getAllStudentsData = async (req, res, next) => {
  try {
    const students = await StudentData.find()
    res.status(201).json({ message: "Success", students })
  } catch (error) {
    res.status(500).json({ message: "Failed getting all students", error })
  }
}

// sending email to students
const sendMailToStudents = async (req, res, next) => {
  const { students } = req.body
  const { feesType } = req.params
  try {
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
    const { name, _for } = req.body

    const buffer = circular.data

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "circulars" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file" })
        } else {
          const newCircular = new CircularData({
            name,
            file: {
              avatar: result.secure_url,
              cloudinary_id: result.public_id,
            },
            for: _for,
          })
          await newCircular.save()

          let students = null

          if (_for === "all") students = await StudentData.find()
          else {
            const regex = new RegExp(`^${_for}\\D`)
            students = await StudentData.find({
              division: { $regex: regex },
            })
          }

          const mailOptions = {
            from: `${process.env.SMTP_NAME} ${process.env.SMTP_MAIL}`,
            subject: `New Circular for Semester ${_for} students!!!`,
          }

          try {
            students?.map(async (s) => {
              mailOptions.to = s?.email
              mailOptions.html = `
                <!DOCTYPE html>
                <html lang="en">
                <body>
                <div>
                  <p>Dear ${s?.name},</p>
                  <p>A new circular <strong><a href=${process.env.CLIENT_URL}/${result?.public_id} target="_blank">(${name})</a></strong> has just been uploaded.</p>
                  <br/>
                  <p>Thank You,</p>
                  <p>Aadarsh University</p>
                </div>
                </body>
                </html>
              `
              await transporter.sendMail(mailOptions)
            })
          } catch (error) {
            return res
              .status(500)
              .json({ message: "Failed to send email", error })
          }
        }
      }
    )

    uploadStream.end(buffer)
    return res.status(201).json({
      message: "File uploaded successfully!",
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

// delete circular
const deleteCircular = async (req, res, next) => {
  try {
    const circular = await CircularData.findById(req.params._id)
    await cloudinary.uploader.destroy(circular.file.cloudinary_id)
    await circular.deleteOne({ _id: req.params._id })
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete circular", error })
  }
}

// create syllabus
const createSyllabus = async (req, res, next) => {
  try {
    const { syllabus } = req.files
    const { semester, department, subject } = req.body

    const buffer = syllabus.data

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "syllabus" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file" })
        } else {
          const newSyllabus = new SyllabusData({
            subject,
            file: {
              avatar: result.secure_url,
              cloudinary_id: result.public_id,
            },
            semester,
            department,
          })
          await newSyllabus.save()
        }
      }
    )

    uploadStream.end(buffer)
    return res.status(201).json({
      message: "File uploaded successfully!",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to save syllabus", error })
  }
}

// read all syllabus
const allSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusData.find()
    res.status(201).json({
      message: "success",
      data: syllabus,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get syllabus", error })
  }
}

// delete syllabus
const deleteSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusData.findById(req.params._id)
    await cloudinary.uploader.destroy(syllabus.file.cloudinary_id)
    await syllabus.deleteOne({ _id: req.params._id })
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete syllabus", error })
  }
}

// create syllabus
const createExam = async (req, res, next) => {
  try {
    const { exam_file } = req.files
    const { semester, department, exam_type } = req.body

    const buffer = exam_file.data

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "exams" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file" })
        } else {
          const newExam = new ExamData({
            file: {
              avatar: result.secure_url,
              cloudinary_id: result.public_id,
              exam_type,
            },
            semester,
            department,
          })
          await newExam.save()
        }
      }
    )

    uploadStream.end(buffer)
    return res.status(201).json({
      message: "File uploaded successfully!",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to save exam", error })
  }
}

// read all syllabus
const allExams = async (req, res, next) => {
  try {
    const exam = await ExamData.find()
    res.status(201).json({
      message: "success",
      data: exam,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get exam", error })
  }
}

// delete syllabus
const deleteExam = async (req, res, next) => {
  try {
    const exam = await ExamData.findById(req.params._id)
    await cloudinary.uploader.destroy(exam.file.cloudinary_id)
    await exam.deleteOne({ _id: req.params._id })
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete exam", error })
  }
}

// create achievement
const createAchievement = async (req, res, next) => {
  try {
    const { achievement } = req.files

    const buffer = achievement.data

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "achievements" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file" })
        } else {
          const newAchievement = new AchievementData({
            file: {
              avatar: result.secure_url,
              cloudinary_id: result.public_id,
            },
          })
          await newAchievement.save()
        }
      }
    )

    uploadStream.end(buffer)
    return res.status(201).json({
      message: "File uploaded successfully!",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to save achievement", error })
  }
}

// read all achievements
const allAchievements = async (req, res, next) => {
  try {
    const achievements = await AchievementData.find()
    res.status(201).json({
      message: "success",
      data: achievements,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get achievements", error })
  }
}

// delete achievement
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await AchievementData.findById(req.params._id)
    await cloudinary.uploader.destroy(achievement.file.cloudinary_id)
    await achievement.deleteOne({ _id: req.params._id })
    res.status(201).json({
      message: "success",
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete achievement", error })
  }
}

module.exports = {
  addStudents,
  getAllStudentsData,
  sendMailToStudents,
  createCircular,
  allCirculars,
  deleteCircular,
  createSyllabus,
  allSyllabus,
  deleteSyllabus,
  createExam,
  allExams,
  deleteExam,
  createAchievement,
  allAchievements,
  deleteAchievement,
}
