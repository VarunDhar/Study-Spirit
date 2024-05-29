const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {videoUploader} = require("../utils/videoUploader");
require("dotenv").config();

exports.createSubSection = async (req,res)=>{
    try {
        
        const {title,description,timeDuration,sectionId} = req.body;
        const {videoFile} = req.files;
        if(!title || !description || !timeDuration || !videoFile){
            return res.status(400).json({
                success:false,
                message:"ERROR: Missing data to create Subsection."
            });
        }

        //uploading video
        const videoUrl = await videoUploader(videoFile,process.env.UPLOAD_FOLDER);
        //add newsubsection to DB
        const newSubSection = await SubSection.create({title,description,timeDuration,videoUrl:videoUrl.secure_url});
        console.log("SubSection created: ",newSubSection);
        
        //updated subsection list in section DB
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{$push:{subSection:newSubSection._id}},{new:true});
        console.log(`Updated subsection list for ${updatedSection.sectionName} is: ${updatedSection}`);

        res.status(200).json({
            success:true,
            message:"SUCCESS: SubSection created successfully.",
            newSubSection
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"ERROR: creating Subsection.",
            errorMessage:error.message
        })
    }
}