const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

exports.createRating = async (req,res)=>{
    try {

        const {userId} = req.user;
        const {rating,review,courseId} = req.body;

        if(!rating || !review){
            res.status(400).json({
                success:false,
                message:"ERROR: Fill details to give review.",
            });
        }
        const reviewExists = await RatingAndReview.findById({userId});
        if(reviewExists){
            res.status(400).json({
                success:false,
                message:"ERROR: Review already exists for this user.",
            });
        }
        const createdReview = await RatingAndReview.create({user:userId,review,rating,course:courseId});

        const updatedCourse = await Course.findByIdAndUpdate({courseId},{$push:{ratingAndReviews:createdReview._id}},{new:true});

        console.log("Updated course is : ",updatedCourse);
        
        res.status(200).json({
            success:true,
            message:`SUCCESS: Review added successfully to course : ${updatedCourse.courseName}`
        });
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: Creating review.",
        });
    }
}

exports.getAverageRating = async (req,res)=>{
    try {
        
        const {courseId} = req.body;
        let totalRating = 0;
        const course = await Course.findById({courseId});
        const totalReviews = course.ratingAndReviews.length;
        if(totalReviews===0){
            res.status(400).json({
                success:false,
                message:"ERROR:No reviews present",
                averageRating:"0"
            })
        }
        // for(let i=0;i<totalReviews;i++){
        //     const reviewRetrieved = await RatingAndReview.findById({_id:course.ratingAndReviews[i]});

        //     totalRating+= parseFloat(reviewRetrieved.rating);
        // }

        const ans = await RatingAndReview.aggregate([
            {
                $match:{course:courseId}
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
                
            }
        ])

        // const averageRating = totalRating/totalReviews;
        
        res.status(200).json({
            success:true,
            message:`SUCCESS: Avg rating retrieved successfully of course : ${course.courseName}`,
            averageRating:ans[0].averageRating
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: getting average rating.",
        });
    }
}

exports.getAllRatings = async(req,res)=>{
    try {
        
        const allReviews = await RatingAndReview.find({}).sort({rating:"desc"}).populate({path:"user",select:"firstName lastName image email"}).populate({
            path:"course",
            select:"courseName"
        }).exec();

        res.status(200).json({
            success:true,
            message:`SUCCESS: All reviews fetched successfully`,
            allReviews
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: getting all ratings.",
        });
    }
}