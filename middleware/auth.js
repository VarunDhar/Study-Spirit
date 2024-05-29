const jwt = require("jsonwebtoken");
require("dotenv").config();

async function auth(req,res,next){
    try {
        
        const token =req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"ERROR: Token couldn't be retrieved for authorization."
            })
        }

        const payload =await jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = payload;
        next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: authorizing.=> " +error.message 
        });
    }
}

function isStudent(req,res,next){
    try {
        
        if(req.user.accountType === "Student"){
             
            next();

        }
        else{
            return res.status(400).json({
                success:false,
                message:"User not authorized for student route."
            })
        }

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: authorizing for Student=> " +error.message 
        });
    }
}

function isAdmin(req,res,next){
    try {
        if(req.user.accountType === "Admin"){
            
            next();

        }
        else{
            return res.status(400).json({
                success:false,
                message:"User not authorized for Admin route."
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: authorizing for Admin=> " +error.message 
        });
    }
}

function isTeacher(req,res,next){
    try {
        if(req.user.accountType === "Teacher"){
            
            next();
        }
        else{
            return res.status(400).json({
                success:false,
                message:"User not authorized for Teacher route."
            })
        }

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: authorizing for Teacher => " +error.message 
        });
    }
}

module.exports = {auth,isAdmin,isStudent,isTeacher};