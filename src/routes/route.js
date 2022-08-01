const express= require('express');
const router= express.Router();
const {filesUpload} =require('./aws/aws')
const {createUser,userLogin, getUser, updateUser}=require('./controller/userController')
const { createProduct, getProduct, getProductById,updateProduct,deleteProduct} = require('./controller/productController');
const {userValidation, loginUserValidation,updateUserValidation}=require('./validation/userValidation')
const {authentication,authorisationUserUpdate}=require('./auth/userAuth');
const { createCart } = require('./controller/cartController');


/*-----------User's API-----------------*/
router.post('/register', filesUpload, userValidation,createUser)
router.post('/login', loginUserValidation,userLogin) 
router.get('/user/:userId/profile',authentication,getUser) 
router.put('/user/:userId/profile',updateUserValidation,authorisationUserUpdate,updateUser)

/*-----------Products's API-----------------*/
router.post('/products', filesUpload, createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

router.post('/users/:userId/cart', createCart)


router.all('/**',function(req,res){
    res.status(404).send({status:false,message:'the api you request, Is not found'})
})

module.exports=router;