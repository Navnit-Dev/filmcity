const express  = require('express');
const router = express.Router()
const admin= require('../models/admin-model');
const { compare } = require('bcryptjs');

router.route('/login').post(async (req,res) => {

    const {username,password} = req.body;
    try {
        const User =  await admin.findOne({username});
    if(!User){
       return res.status(400).json({msg:"User Not Found"})
    }
    
    const IsMatch = await compare(password,User.password)

    if(!IsMatch){
       return res.json({msg:"Invalid Password"})
    };

    res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.log("server Error",error)
        return res.status(400).json({err:error.message})
    }
    
})

module.exports = router