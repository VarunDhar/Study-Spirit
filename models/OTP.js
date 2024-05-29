const mongoose = require("mongoose");
const {mailSender} = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    otp:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        require:true,
        default:Date.now(),
        expires: 5*60
    }
});

async function sendVerificationMail(email,otp){
    try {
        const mailResponse = await mailSender(email,"Verification email from Study Spirit",otp);
        console.log("Verification mail sent successfully: ",mailResponse.response);
        
    } catch (error) {

        console.log("Error sending verification mail:", error);
    }
}

otpSchema.pre("save",async function(next){
    await sendVerificationMail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",otpSchema);