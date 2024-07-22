const express = require("express")
const router = express.Router()

// admin Controllers
const {
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
} = require("../controllers/adminControllers")

// student Routes
router.route("/admin/students/upload").post(addStudents)
router.route("/admin/students/all").get(getAllStudentsData)
router.route("/admin/students/pending/:feesType").post(sendMailToStudents)

// circular routes
router.route("/admin/circular/upload").post(createCircular)
router.route("/admin/circular/all").get(allCirculars)
router.route("/admin/circular/delete/:_id").delete(deleteCircular)

// syllabus routes
router.route("/admin/syllabus/upload").post(createSyllabus)
router.route("/admin/syllabus/all").get(allSyllabus)
router.route("/admin/syllabus/delete/:_id").delete(deleteSyllabus)

// exam routes
router.route("/admin/exam/upload").post(createExam)
router.route("/admin/exam/all").get(allExams)
router.route("/admin/exam/delete/:_id").delete(deleteExam)

// achievement routes
router.route("/admin/achievement/upload").post(createAchievement)
router.route("/admin/achievement/all").get(allAchievements)
router.route("/admin/achievement/delete/:_id").delete(deleteAchievement)

module.exports = router
