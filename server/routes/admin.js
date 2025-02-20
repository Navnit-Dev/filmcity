const express  = require('express');
const router = express.Router()
const admin= require('../models/admin-model')

//Get Admin
router.route("/admin").get(async (req,res)=>{
    try {
        const data = await admin.find()
        res.json(data)
    } catch (error) {
        console.log("Server Error !")
    }
})

//Add Admin
router.route('/admin').post( async(req,res)=>{
    try {
        const EnteredData = new admin(req.body)
        const SaveDate = await EnteredData.save()
        res.status(201).json(SaveDate);
        console.log('Admin Added Successfully')
    } catch (error) {
        res.status(400).json({'message':`Data Not added ! ${error}`})
    }
})

//Update Admin
router.route('/admin/:id').put(async (req, res) => {
    try {
        const adminId = req.params.id;
        const updatedData = req.body;

        const updatedAdmin = await admin.findByIdAndUpdate(adminId, updatedData, { new: true });
        await updatedAdmin.save()
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(updatedAdmin);
        console.log('Admin Updated Successfully');
    } catch (error) {
        res.status(400).json({ message: `Data Not Updated! ${error}` });
    }
});

//Delete Admin 
router.route('/admin/:id').delete(async (req,res)=> {
    try {
        const MovieId = req.params.id
        const DeletedAdmin = await admin.findByIdAndDelete(MovieId);
        if(!DeletedAdmin){
            res.status(400).json({message:"Admin not Found !"})
        }else{
        console.log("Admin Deleted")
            res.status(200).json({msg:"Admin Deleted Successfully.."})
        }
    } catch (error) {
        console.log(error)
    }
   
})

//Get Admin By Id
router.route('/admin/:id').get(async (req,res) => {
    try {
        const AdminId = req.params.id;
        const FindedAdmin = await admin.findById(AdminId)

    if(!FindedAdmin){
        res.status(400).json({msg:'Admin Not Found'})
    }

    res.json(FindedAdmin)
    } catch (error) {
        res.json({
            msg:error.message
        })
    }
    
})



module.exports = router;