const mongoose = require("mongoose")
const validator = require("validator")

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide A Name"],
    trim: true,
  },
  enrollment: {
    type: Number,
    required: [true, "Please Provide An Enrollment Number"],
    unique: [true, "Duplicate Enrollment Number Provided"],
    validate(value) {
      if (String(value).length !== 12)
        throw new Error("Please Provide A Valid Enrollment Number")
    },
  },
  contact: {
    type: Number,
    required: [true, "Please Provide A Contact Number"],
    validate(value) {
      if (String(value).length !== 10)
        throw new Error("Please Provide A Valid Number")
    },
  },
  email: {
    type: String,
    required: [true, "Please Provide An Email"],
    unique: [true, "Duplicate Email Provided"],
    validate(value) {
      if (!validator.isEmail(value))
        throw new Error("Please Provide A Valid Email")
    },
  },
  division: {
    type: String,
    required: [true, "Please Provide A Division"],
  },
  fees: {
    tuition: {
      total: {
        type: Number,
        required: [true, "Please Provide Total Tuition Fees"],
      },
      paid: {
        type: Number,
        required: [true, "Please Provide Paid Tuition Fees"],
      },
      pending: {
        type: Number,
      },
    },
    hostel: {
      total: {
        type: Number,
        required: false,
      },
      paid: {
        type: Number,
        required: false,
      },
      pending: {
        type: Number,
        required: false,
      },
    },
    bus: {
      total: {
        type: Number,
        required: false,
      },
      paid: {
        type: Number,
        required: false,
      },
      pending: {
        type: Number,
        required: false,
      },
    },
  },
})

const StudentData = new mongoose.model("studentdata", studentSchema)

module.exports = StudentData
