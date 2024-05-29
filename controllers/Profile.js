const { Mongoose, default: mongoose } = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const {imageUploader} = require("../utils/imageUploader");
exports.updateProfile = async (req,res)=>{
    try {
        const {gender,dob="",about="",contactNumber} = req.body;
        const {userId} =  req.user;
        // const convertedUserId =new mongoose.Types.ObjectId(userId);

        if(!gender || !contactNumber){
            return res.status(400).json({
                success:false,
                message:"ERROR: Missing data to update profile."
            });
        }

        const user = await User.findById({_id:userId});
        const userProfile = user.profileInfo;

        //TO TRY:
        //  userProfile.gender = gender; userProfile.DOB = dob; etc. and then await userProfile.save();
        const updatedProfile = await Profile.findByIdAndUpdate({_id:userProfile},{
                                                                                gender:gender,
                                                                                about:about,
                                                                                DOB:dob,
                                                                                contactNo:contactNumber
                                                                            },
        {new:true});
        console.log("HERE 3",user);

        console.log(updatedProfile);
        return res.status(200).json({
            success:true,
            message:"SUCCESS: Profile updated successfully."
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: updating Profile.",
            errorMessage:error
        })
    }
}

exports.deleteAccount = async (req,res) =>{
    try {
        
        //retrieving id of user from Token sent into request
        const {userId} = req.user;
        const user = await User.findById({_id:userId});

        //delete profile of user
        await Profile.findByIdAndDelete({_id:user.profileInfo});

        //delete user from all the courses he enrolled in
        user.courses.map( async (course)=>{
            await Course.findByIdAndUpdate({_id:course},{$pull:{studentsEnrolled:userId}});
        })

        //delete user from DB
        await User.findByIdAndDelete({_id:userId});

        res.status(200).json({
            success:true,
            message:"SUCCESS: User and the Profile deleted successfully."
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: deleting Profile.",
            errorMessage:error.message
        })
    }
}

exports.getAllUserDetails = async (req,res)=>{
    try {
        
        const {userId} = req.user;
        const user = await User.findById({_id:userId}).populate("profileInfo").exec();
        
        res.status(200).json({
            success:true,
            message:"SUCCESS: User details retrieved successfully.",
            user
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: retrieving user details."
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.userId;
      console.log(userId);
      const image = imageUploader(
        displayPicture,
        process.env.UPLOAD_FOLDER,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `SUCCESS:Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:"ERROR: Updating display picture.",
        errorMessage: error.message,
      })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `ERROR:Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        message:"SUCCESS: User enrolled courses fetched.",
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:"ERROR: getting enrolled courses.",
        errorMessage: error.message,
      })
    }
  }

  exports.teacherDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnroled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({message:"SUCCESS:Teacher dashboard displayed.", courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "ERROR:Server Error" })
    }
  }