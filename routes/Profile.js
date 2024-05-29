const express = require("express")
const router = express.Router()
const { auth, isTeacher } = require("../middleware/auth")
const {deleteAccount,updateProfile,getAllUserDetails,updateDisplayPicture,getEnrolledCourses,teacherDashboard} = require("../controllers/profile")

//Profile routes
// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/teacherDashboard", auth, isTeacher, teacherDashboard)

module.exports = router