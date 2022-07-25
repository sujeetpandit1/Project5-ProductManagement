const express= require('express');
const router= express.Router();
const {filesUpload} =require('../aws/aws')
const {createUser}=require('./controller/userController')



router.post('/register', filesUpload, createUser)


router.all('/**',function(req,res){
    res.status(404).send({status:false,message:'the api you request, Is not found'})
})

module.exports=router;