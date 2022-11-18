const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        default:false
    },
    likedMovie:[
        {
            id:Number,
            title: String,
            rating: Number,
            genre:[
                
            ]
        }
    ]
})
userSchema.methods.genAuthToken =  function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    return token
}
const User = mongoose.model('User',userSchema)

module.exports = User;

/*
  id
  Title
  rating
  genre
*/