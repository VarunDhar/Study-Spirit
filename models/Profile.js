const mongoose = require("mongoose");
require("dotenv").config();

const profileSchema = new mongoose.Schema({
    
    gender:{
        type:String,
        default:null
    },
    about:{
        type:String,
        trim:true,
        default:null
    },
    contactNo:{
        type:String
    },
    DOB:{
        type:String,
        default:null
    }
    
});

module.exports = mongoose.model("Profile",profileSchema);