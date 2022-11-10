const bcrypt = require('bcrypt');
const saltRounds = 10;

const genHashPass = async (password)=>{
    const salt = await bcrypt.genSaltSync(saltRounds);
    console.log(password);
    const hashedPass = await bcrypt.hashSync(password, salt);

    return hashedPass;
}
const verifyPass =async (newPass, oldPass)=>{
    return await bcrypt.compare(newPass,oldPass);
}



module.exports = {verifyPass, genHashPass}