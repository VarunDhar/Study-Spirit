const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
// const {createCourse,getAllCourses,getCourseDetails,getFullCourseDetails,editCourse,getInstructorCourses,deleteCourse,} = require("../controllers/Course")
const {createCourse,getAllCourses,getCourseDetails} = require("../controllers/Course")

// Tags Controllers Import

// Categories Controllers Import
const {showAllCategory,createCategory,categoryPageDetails,} = require("../controllers/Category")

// Sections Controllers Import
const {createSection,updateSection,deleteSection,} = require("../controllers/Section")

// Sub-Sections Controllers Import
// const {createSubSection,updateSubSection,deleteSubSection} = require("../controllers/Subsection")
const {createSubSection} = require("../controllers/Subsection")

// Rating Controllers Import
const {createRating,getAverageRating,getAllRatings,} = require("../controllers/RatingAndReview")
// const {updateCourseProgress,getProgressPercentage} = require("../controllers/CourseProgress.js")
const {updateCourseProgress} = require("../controllers/CourseProgress.js")

// Importing Middlewares
const { auth, isTeacher, isStudent, isAdmin } = require("../middleware/auth")

//Course routes

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isTeacher, createCourse)
// Edit Course routes
// router.post("/editCourse", auth, isTeacher, editCourse)
//Add a Section to a Course
router.post("/addSection", auth, isTeacher, createSection)
// Update a Section
router.post("/updateSection", auth, isTeacher, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isTeacher, deleteSection)
// Edit Sub Section
// router.post("/updateSubSection", auth, isTeacher, updateSubSection)
// // Delete Sub Section
// router.post("/deleteSubSection", auth, isTeacher, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isTeacher, createSubSection)
// Get all Courses Under a Specific Instructor
// router.get("/getInstructorCourses", auth, isTeacher, getInstructorCourses)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
// router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// To Update Course Progress
// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// To get Course Progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)
// Delete a Course
// router.delete("/deleteCourse", deleteCourse)

// Category routes (Only by Admin)
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategory)
router.post("/getCategoryPageDetails", categoryPageDetails)

//Rating and Review
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatings)

module.exports = router