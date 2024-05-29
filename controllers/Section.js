const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res)=>{
    try {
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"ERROR: Missing data to create section."
            });
        }

        const newSection = await Section.create({sectionName:sectionName});
        const updatedCourse = await Course.findByIdAndUpdate({_id:courseId},{$push:{courseContent:newSection._id}},{new:true});
        console.log("Updated course: ",updatedCourse);

        res.status(200).json({
            success:true,
            message:"SUCCESS:Section created successfully."
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: creating section.",
            errorMessage:error.message
        })
    }
}

exports.updateSection = async (req,res) =>{
    try {
        
        const {sectionName, sectionId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"ERROR: Missing data to update section."
            });
        }

        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{sectionName});
        if(!updatedSection){
            return res.status(400).json({
                success:false,
                message:"ERROR: Invalid sectionId.",
            })
        }
        res.status(200).json({
            success:true,
            message:"SUCCESS:Section updated successfully."
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: Updating section.",
            errorMessage:error.message
        })
    }
}

exports.deleteSection = async (req,res)=>{
    try {
        const {sectionId} = req.body;

        const deletedSection = await Section.findByIdAndDelete(sectionId);
        if(!deletedSection){
            return res.status(400).json({
                success:false,
                message:"ERROR: Invalid sectionId."
            })
        }
        res.status(200).json({
            success:true,
            message:"SUCCESS:Section deleted successfully."
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: deleting section.",
            errorMessage:error.message
        })
    }
}