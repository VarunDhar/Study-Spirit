const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function sendOTP(req,res){
    try {
        
        const {email}  = req.body;

        //check if email already exists or not
        const doc =await User.find({email:email});
        if(doc.length){
            console.log(doc);
            return res.status(400).json({
                success:false,
                message:"ERROR: User already exists"
            })
        }
        //generate otp, check if its unique by searching for it in OTP db, and then store this otp in db for verification purpose
        let otpGenerated = otpGenerator.generate(4,{upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false});
        while(await OTP.findOne({otp:otpGenerated}) != null){
            otpGenerated = otpGenerator.generate(4,{upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false});
        }
        const newDoc =await OTP.create({email:email,otp:`${otpGenerated}`});
        


        return res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp:otpGenerated
        });

        // //send mail to the email for otp verification
        // mailSender(email,"OTP to verify Signup",`<b>OTP for verifying Signup</b><br><p>${otpGenerated}</p>`);
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: Error sending OTP",
            errorMessage: error.message

        })
    }
}

async function signUp(req,res){

    try {
        const {email,firstName, lastName, contactNo,password, confirmPassword,otp,accountType} = req.body;
    //validate inputs
    if(!email || !firstName || !lastName || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"ERROR: Details missing for signup"
        })
    }
    if(confirmPassword !== password){
        return res.status(400).json({
            success:false,
            message:"ERROR: Passwords do not match."
        })
    }
    //check if user already exists
    const doc =await User.find({email:email});
        if(doc.length){
            return res.status(400).json({
                success:false,
                message:"ERROR: User already exists"
            })
        }
    const latestOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);


    if(latestOTP=== null){
        return res.status(400).json({
            success:false,
            message:"ERROR: OTP expired/not sent. Unable to verify."
        })
    }
    if(latestOTP[0].otp !== otp){
        return res.status(400).json({
            success:false,
            message:"ERROR: OTP entered not valid."
        })
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const profileEntry = await Profile.create({contactNo});

    const userEntry = await User.create({
        email,
        firstName,
        lastName,
        profileInfo:profileEntry._id,
        password:hashedPass,
        accountType:accountType,
        image:`https://api.dicebear.com/5.x/initials/svg/seed=${firstName} ${lastName}`
    });

   return res.status(200).json({
        success:true,
        message:"SUCCESS:User signed up successfully."
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: Error while signing up.",
            errorMessage: error.message

        })
    }
}


async function login(req,res){

    try {
        const {email,password,accountType} = req.body;
    //validate inputs
    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"ERROR: Inputs missing for login."
        })
    }
    //check if user already exists
    const doc =await User.findOne({email:email,accountType:accountType});
    if(doc === null){
        return res.status(400).json({
            success:false,
            message:"ERROR: User doesn't exist."
        })
    }

    //if password is incorrect
    let passwordMatch = await bcrypt.compare(password, doc.password);
    if(!passwordMatch ){
        return res.status(400).json({
            success:false,
            message:"ERROR: Password entered incorrect."
        })
    }

    //generating jwt token
    let jwtSecretKey = process.env.JWT_SECRET_KEY; 
    let data = { 
        email:email,
        accountType:accountType,
        userId:doc._id
    } 

    const token = jwt.sign(data, jwtSecretKey,{
        expiresIn:"2h"
    }); 
    

    doc.password = null;
    doc.token = token;

    //sending cookie
    res.cookie("token",token,{
        expires:new Date(Date.now() + 3*24*60*60*1000),
        httpOnly:true
    }).status(200).json({
        success:true,
        message:"User logged in successfully.",
        user:doc
    })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: Error while logging in.",
            errorMessage:error.message
        })
    }
}

async function changePassword(req,res){
    try {
        const {email,oldPass, newPass, confirmNewPass} = req.body;
        const user = await User.findOne({email,password:await bcrypt.hash(10,oldPass)});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"ERROR: Old Password incorrect."
            })
        }

        if(!newPass || !confirmNewPass || newPass !== confirmNewPass){
            return res.status(400).json({
                success:false,
                message:"ERROR: New passwords are missing/not matching."
            })
        }
        
        const hashedNewPass = await bcrypt.hash(10,newPass);
        const updatedUser = await User.findOneAndUpdate({email},{password:hashedNewPass},{new:true});
        
        return res.status(200).json({
            success:true,
            message:"Password changed successfully."
        })

    } catch (error) {
        return res.send(500).json({
            success:false,
            message:"ERROR: Error while changing password.",
            errorMessage: error.message
        })
    }
}

module.exports = {sendOTP,signUp,login,changePassword};