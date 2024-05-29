const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String
    },
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"Course"
    }]
});

module.exports = mongoose.model("Category",categorySchema);