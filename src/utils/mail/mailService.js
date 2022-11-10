const nodemailer = require('nodemailer')
const { google } = require("googleapis");


//these we get from google auth console
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;  // it changes with some time period

//google api installation

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


const sendEmail = async (receiverEmail,username,link,subject) => {
    try {
      // console.log("hehfhehfehfheh");
      const accessToken = await oAuth2Client.getAccessToken();
      // console.log("link: "+msg);
      const transport =await nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: `initiatetenet@gmail.com`,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });

     
      const mailOptions = {
        from: "Movie-Search Engine ✉ <initiatetenet@gmail.com>",
        to: receiverEmail,
        subject: subject,
        text: "Mail for verification.", // plain text body
        html:`<div style="background-color:#F9F9F9; padding:12px"><h2>Hello ${username.toUpperCase()}!!</h2><br><p>We're glad to have you on board at Movie-Search-Engine. </p><br>Verfiy your account by clicking on the Link.<br>${link}<p style="color:#000000; background-color:#F5EFE6"; text-align:center">Valid only for 10 minutes</p></div>`, // html body
      };

      
        await transport.sendMail(mailOptions);
        
        return {
          status:401,
          message:"Email sent Successfull"
        }

    } catch (error) {
        return {
          status:501,
          message:error.message
        }
    }
}

module.exports = {sendEmail};