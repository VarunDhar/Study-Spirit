const nodemailer = require("nodemailer");
require("dotenv").config();

async function mailSender(email,title,body){
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });
        let info = await transporter.sendMail({
            from: `Study-Spirit`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log(info);
        return info;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
}

module.exports = {mailSender};