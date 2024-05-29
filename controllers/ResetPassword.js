const User = require("../models/User");
const bcrypt = require("bcrypt");
const {mailSender} = require("../utils/mailSender");
const crypto = require("crypto");
exports.resetPasswordToken = async (req,res)=>{
    try {
        
        const email = req.body.email;
        const user = await User.find({email});
        if(!user){
            res.status(400).json({
                success:false,
                message:"ERROR: User doesn't exist."
            })
        }
        const token = crypto.randomUUID();
        const updatedUser = await User.findOneAndUpdate({email},{token:token,tokenExpiresIn:Date.now() + 5*60*1000},{new:true});

        const url = `https://localhost:3000/update-password/${token}`;
        
        await mailSender(email,"Reset Password", `URL to reset your password : ${url}`);

        res.status(200).json({
            success:true,
            message:"Reset URL sent successfully to email."
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error: Error generating token for password reset.",
            errorMessage:error.message
        })
    }
}

exports.resetPassword = async (req,res) =>{
    try {
        const {newPassword, confirmNewPassword,token} = req.body;
        if(!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword){
            res.status(400).json({
                success:false,
                message:"ERROR: Passwords don't match / are invalid."
            })
        }
        const user = await User.findOneAndUpdate({token});
        if(!user || Date.now() - user.tokenExpiresIn >5*60*1000){
            res.status(400).json({
                success:false,
                message:"ERROR: User doesn't exist/invalid token."
            })
        }


        const hashedPass = await bcrypt.hash(newPassword,10);
        const updatedUser = await User.findOneAndUpdate({token},{password:hashedPass},{new:true});

        res.status(200).json({
            success:true,
            message:"User password resetted successfully."
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error: Error resetting the password.",
            errorMessage:error.message
        })
    }
}