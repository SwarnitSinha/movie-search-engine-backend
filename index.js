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
app.put('/changePassword',async (req,res)=>{
    try {
        console.log("pasword change clicked")
        console.log(req.headers.token);
        const result = await jwt.verify(req.headers.token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:result._id});
        const passCorrect = await verifyPass(req.body.oldPass,user.password)
        if(passCorrect){
            //update user with new password
            user.password = await genHashPass(req.body.newPass);
        }
        user.save();
        res.json({
            message:"Password has been changed",
            status:"Success",
            error:null,
            success_code:200
        })
        
    } catch (error) {
        console.log(error);
        res.json({
            message:"Internal error",
            status:"Failed",
            error:error,
            success_code:500
        })
    }
})
app.post('/saveMovie', async(req,res)=>{
    // console.log(req.body);
    // console.log(req.headers.token)
    //verify the token
    try {
        console.log("while saving : ",req.headers.token);
        const result = await jwt.verify(req.headers.token,process.env.JWT_SECRET);

        const user = await User.findOne({_id:result._id})
        const movie = {
            id:req.body.id,
            title:req.body.title,
            rating:req.body.rating,
            genre:req.body.genre
        }
        user.likedMovie.push(movie);
        await user.save();
        res.json({
            status:"success",
            data:user.likedMovie,
            error:null
        })
            
    } catch (err) {
        console.log(err);
        res.json({
            status:"Failed",
            message:"Internal Server Error",
            data:null,
            error:error
        })
    }
    // find user by this result
})

app.delete('/delMovie', async(req,res)=>{
    try {
        const result = await jwt.verify(req.headers.token,process.env.JWT_SECRET);
        console.log("anything");
        const user = await User.findOne({_id:result._id});
        // console.log(user);

        // del movie in user's movie list by checking id
        const movieIndex = await user.likedMovie.findIndex((item)=>item.id===req.body.movieId)
        console.log(user.likedMovie.length);
        
        await user.likedMovie.splice(movieIndex,1);
        await user.save();
        console.log(user.likedMovie.length);
        res.json({
            message:"del",
            error:null
        })

    } catch (error) {
        res.json({
            message:"Error happend",
            error:error
        })
    }
    
})

app.get('/getLikedMovies', async(req,res)=>{
    
    try {
        console.log("token",req.headers.token)
        if(!req.headers.token)return res.json({data:null})
        const result = await jwt.verify(req.headers.token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:result._id});
        res.json({
            status:"Success",
            message:"Liked Movies found",
            data: user.likedMovie,
            error:null
        })
    } catch (error) {
        // console.log(error);
        res.json({
            status:"Failed",
            message:"Internal Server Error",
            data:null,
            error:error
        })
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