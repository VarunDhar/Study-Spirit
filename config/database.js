require("dotenv").config();
const mongoose = require("mongoose");


async function dbConnect(){
    try {
        await mongoose.connect(process.env.DB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("SUCCESS:Connection to DB successful.");
    } catch (error) {
        console.log("ERROR: connecting to DB.");
    }
}

module.exports = {dbConnect};