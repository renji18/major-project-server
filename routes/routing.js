const express = require("express")
const router = express.Router()

// admin Controllers
const {
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
} = require("../controllers/adminControllers")

// admin Routes
router.route("/admin/students/upload/new").post(addStudents)
router.route("/admin/students/upload/append").post(appendNewStudents)
router.route("/admin/students/all").get(getAllStudentsData)
router.route("/admin/students/single/:enrollmentId").get(getSingleStudentData)
router.route("/admin/students/pending/:feesType").post(sendMailToStudents)
router.route("/admin/circular/upload").post(createCircular)
router.route("/admin/circular/single/:_id").get(singleCircular)
router.route("/admin/circular/delete/:_id").delete(deleteCircular)
router.route("/admin/circular/edit/:_id").patch(editCircular)
router.route("/admin/circular/all").get(allCirculars)

module.exports = router
