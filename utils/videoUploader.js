const cloudinary = require("cloudinary").v2;


exports.videoUploader = async (file,folder) =>{
    try {
        const options = {folder};
        
        options.resource_type = "auto";
        
        return await cloudinary.uploader.upload(file.tempFilePath,options);

    } catch (error) {
        console.log("ERROR: uploading Video to cloudinary.",error.message)
    }
}