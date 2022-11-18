const jwt = require('jsonwebtoken')
const {sendEmail} = require('./mailService');

const sendVerificationMail = async (email,username)=>{
    try {
        
        console.log("Email :" + email+" Username : "+username);

        const token = await jwt.sign({email,username},process.env.SECRET_KEY,{ expiresIn: 600 })

        const link = "http://localhost:5000/api/mailVerification?token="+token

        await sendEmail(email,username,link,"OTP-Verification for Movie-Search-Engine");
        
        return;

    } catch (error) {
        console.log("Error occurred : ", error);
        return;
    }
}


module.exports = {sendVerificationMail}
