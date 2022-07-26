const express= require('express');
const router= express.Router();
const {filesUpload} =require('../aws/aws')
const {createUser,userLogin, getUser}=require('./controller/userController')
const {userValidation, loginUserValidation}=require('./validation/userValidation')



router.post('/register', filesUpload, userValidation,createUser)
router.post('/login', loginUserValidation,userLogin) 
router.get('/user/:userId/profile',getUser) 


router.all('/**',function(req,res){
    res.status(404).send({status:false,message:'the api you request, Is not found'})
})

module.exports=router;