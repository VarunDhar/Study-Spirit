const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        require:true,
        trim:true
    },
    lastName:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        trim:true
    },
    password:{
        type:String,
        require:true,
    },
    // confirmPassword:{
    //     type:String,
    //     require:true,
    // },
    accountType:{
        type:String,
        enum:["Admin","Teacher","Student"],
        require:true
    },
    profileInfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        require:true
    },
    token:{
        type:String
    },
    tokenExpiresIn:{
        type:Date
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
    image:{
        type:String,
        require:true
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress"
    }]

    
});

module.exports = mongoose.model("User",userSchema);