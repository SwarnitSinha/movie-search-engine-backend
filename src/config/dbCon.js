const mongoose = require('mongoose');
// require('dotenv').config();

const connect = async ()=>{
    try {
     
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("connected to database");
    } catch (error) {
        console.log("error while connecting to db "+error);
    }
}
module.exports = {connect};