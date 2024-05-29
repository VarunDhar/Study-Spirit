const {instance} = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req,res)=>{
    try {
        
        const {courseId} = req.body;
        const {userId} = req.user;

        const course = await Course.findById({courseId});
        if(course.studentsEnrolled.includes(mongoose.Types.ObjectId(userId))){
            res.status(400).json({
                success:false,
                message:"ERROR: User already enrolled in this course."
            })
        }
        
        const options ={
            amount:course.price*100,
            currency:"INR",
            receipt:Math.random(Date.now()).toString(),
            note:{
                courseId,
                userId
            }
        };
        try {
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            res.status(200).json({
                success:true,
                message:"SUCCESS: Payment response retrieved.",
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                amount:paymentResponse.amount,
                currency:paymentResponse.currency
            })
        } catch (error) {
            res.status(400).json({
            success:false,
            message:"ERROR: while retrieving payment response."
        })
        }


    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: capturing payment."
        })
    }
}

exports.verifySignature = async (req,res)=>{
    try {
        
        const webhookSecret = "abc123";
        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHmac("sha256",webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if(digest === signature){
            console.log("Success: Payment authorized and verified.");

            const {userId, courseId} = req.body.payload.payment.entity.notes;

            try {
                
                const updatedCourse = await Course.findByIdAndUpdate({courseId},{$push:{studentsEnrolled:userId}},{new:true});
                console.log("Course updated: ",updatedCourse);

                if(!updatedCourse){
                    console.log("ERROR: Course not found.");
                }

                const updatedUser = await User.findByIdAndUpdate({userId},{$push:{courses:courseId}},{new:true});
                console.log("Student courses updated: ",updatedUser);

                //send mail to user informing their successful enrollment into the course.
                const informMail = await mailSender(updatedUser.email,"Congratulations of enrolling successfully into Course!",
                    `<>Congratulations, ${updatedUser.firstName}!<h1><br><p>You have successfully enrolled into the course: <b>${updatedCourse.courseName}</b></p>`
                )
                console.log(informMail);

                res.status(200).json({
                    success:true,
                    message:"SUCCESS: Payment verified and user enrolled into the course."
                })
            } catch (error) {
                console.log("ERROR: allotting purchased Course to student.");
            }
        }
        else{
            res.status(400).json({
                success:false,
                message:"ERROR: Payment didn't get verified. Invalid Request."
            })
        }

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: verifying signature."
        })
    }
}