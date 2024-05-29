const mongoose = require("mongoose");
require("dotenv").config();

const courseSchema = new mongoose.Schema({

    courseName:{
        type:String,
        require:true
    },
    courseDescription:{
        type:String
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    whatWillYouLearn:{
        type:String
    },
    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section"
    }],
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReview"
    }],
    price:{
        type:Number,
        require:true
    },
    thumbnail:{
        type:String
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    tag:[{
        type:String
    }],
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    }],
    instructions:{
        type:[String]
    },
    status:{
        type:String,
        enum:["Draft", "Published"]
    }
    
});

module.exports = mongoose.model("Course",courseSchema);