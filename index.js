const express = require('express');
const app = express();
require('dotenv').config();
const User = require('./src/model/user');
const cors = require('cors')
const db = require('./src/config/dbCon');
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(express.json())

//import from files
const {verifyPass, genHashPass} = require('./src/utils/password')
const {sendVerificationMail} = require('./src/utils/mail/mailer');
const { JWT } = require('google-auth-library');



app.get('/',(req,res)=>{
    res.json({
        message:"working fine",
        status_code:200
    })
})
app.get('/api/mailVerification',async(req,res)=>{
    try {
        const result = await jwt.verify(req.query.token,process.env.SECRET_KEY);
        console.log("result from ",result);

        //update the user with the email 

        await User.updateOne({email:result.email},{$set:{verified:true}})
 
        res.json({
            message: result.username+" verification on going",
            status:200,
            error:null
        })

    } catch (error) {
        console.log(error);
    }
})
app.post('/login',async(req,res)=>{
    //check if user exist then match password then return user with token
    const user = await User.findOne({email:req.body.email});
    if(!user){
        res.json({
            status:"failed",
            message:"Signup first",
            data:null,
            error:"user not found",
            status_code:401
        })
    }
    //match passowrd
    const passCorrect = await verifyPass(req.body.password,user.password)
    if(!passCorrect){
        return res.json({
            status:400,
            error:true,
            message:"Wrong Credential"
        })
    }
    console.log(user.isVerified)
    if(!user.isVerified){

        //LOGIC FOR SENDING VERIFICATION MAIL
  
        await sendVerificationMail(req.body.email,user.username);

        return res.json({
            status:"success",
            status_code:200,
            error:true,
            message:"Verfication email has been sent to your email"
        })
    }
    // now login

    const token = await user.genAuthToken()

    res.json({
        status:200,
        token:token,
        username:user.username,
        isVerified: user.isVerified
    })


})
app.post('/signup',async(req,res)=>{

    try {
        const alreadyUser = await User.findOne({email:req.body.email});
        if(alreadyUser){
            res.json({
                status_code:401,
                message:"User already exist",
                error:null,
                data:user.email
            })
        }
        //create user
        const password = await genHashPass(req.body.password);

        const user =new User({
            username: req.body.username,
            email:req.body.email,
            password:password
        })
        
        await user.save();
        //verify password   
        await sendVerificationMail(req.body.email,user.username);   
        res.json({
            status_code:200,
            status:"success",
            message:"Account created. Verification link has been sent to the mail",
            data:null,
            error:null
            
        })
        
    } catch (error) {
        console.log(error);
    }

})

db.connect();
const port = process.env.PORT || 5000;
app.listen(port,(req,res)=>{
    console.log("server is running at 5000");
})

// echo "# movie-search-engine-backend" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/SwarnitSinha/movie-search-engine-backend.git
// git push -u origin main