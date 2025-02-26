const nodemailer = require('nodemailer');               //install it and paste code from nodemailer at w3school
const {handleResponse}= require("../../Responses/Responses")
require("dotenv").config()

const transporter = nodemailer.createTransport({      //create medium to transfer otp from email of superadmin to email of shopkeeper
  service: 'gmail',
  auth: {
    user: 'shreya.sharma9m@gmail.com',
    pass: process.env.EMAIL_SERVICE_PASS   //app password==>2factorauth...apppassword search in mail....appname and copy pss
  }
});

const otptoemailforverification=async(resp,email,otp)=>{
  
    var mailOptions = {
        from: 'shreya.sharma9m@gmail.com',
        to: email,
        subject: 'OTP for Account Creation on Restaurant App',
        text: 'Your OTP is :'+otp
      };

      try {
        const info= await  transporter.sendMail(mailOptions)
        return handleResponse(resp,202,"OTP send successfully",info.response)
      } catch (error) {
        return handleResponse(resp,400,"Email is not valid")
      }
    }

module.exports={otptoemailforverification}