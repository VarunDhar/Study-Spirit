const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const {dbConnect} = require("./config/database");
const {cloudinaryConnect} = require("./config/cloudinary");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 4000;

dbConnect();
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true
    })
);
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp"
}));

app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",courseRoutes);

app.get("/",(req,res)=>{
    res.send("<h1>This is the default route.</h1>");  
})

app.listen(PORT,(req,res)=>{
    console.log("App is running successfully at Port:",PORT);
})
