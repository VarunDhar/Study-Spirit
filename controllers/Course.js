const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const {imageUploader} = require("../utils/imageUploader");
require("dotenv").config();

exports.createCourse = async (req,res) =>{
    try {
        
        const {courseName,courseDescription,whatWillYouLearn,price,category,tag} = req.body;
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !category){
            return res.status(400).json({
                success:false,
                message:"ERROR:Missing data for course."
            })
        }

        const categoryDoc = await Category.findOne({_id:category});
        if(!categoryDoc){
            return res.status(400).json({
                message:"ERROR: Invalid category for the course."
            })
        }

        //upload thumbnail
        const thumbnailImageUpload = await imageUploader(thumbnail,process.env.UPLOAD_FOLDER);

        //add course to DB
        const course = await Course.create({
                                            courseName,
                                            courseDescription,
                                            whatWillYouLearn,
                                            instructor:req.user.userId,
                                            thumbnail:thumbnailImageUpload.secure_url,
                                            price,
                                            category,
                                            tag
                                        });
        const updatedInstructorCourseList = await User.findByIdAndUpdate({_id:req.user.userId},{$push: { courses: course._id }},{new:true});
        console.log("Updated course list for user : ",updatedInstructorCourseList);

        const updatedCategoryList = await Category.findByIdAndUpdate({_id:category},{$push: { course: course._id }},{new:true});
        console.log("Updated category's courses: ",updatedInstructorCourseList);
        

        res.status(200).json({
            success:true,
            message:"Course added successfully."
        });


    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: Creating course."
        })
    }
}

exports.getAllCourses = async (req,res) =>{
    try {
        
        const allCourses = await Course.find({},{price:true,
                                                instructor:true,
                                                studentsEnrolled:true,
                                                courseName:true,
                                                courseDescription:true,
                                                ratingAndReviews:true,
                                                thumbnail:true,
                                                category:true
        })

        res.status(200).json({
            success:true,
            message:"Courses fetched successfully.",
            data:allCourses
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: Fetching all courses."
        })
    }
}

exports.getCourseDetails = async (req,res)=>{
    try {
        
        const {courseId} = req.body;

        const courseDetails = await Course.findById({_id:courseId}).populate(
                                                                        {path:"instructor",
                                                                        populate:{
                                                                            path:"profileInfo"
                                                                        }
                                                                    }
                                                                        ).populate("category").populate({
                                                                            path:"courseContent",
                                                                            populate:{
                                                                                path:"subSection"
                                                                            }
                                                                        })
                                                                        // .populate("ratingAndReviews")
                                                                        .exec();

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"ERROR: Couldn't find course with given courseId."
            })
        }

        res.status(200).json({
            success:true,
            message:"Course details fetched successfully.",
            data:courseDetails
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: Fetching course details.",
            errorMessage: error.message
        })
    }
}