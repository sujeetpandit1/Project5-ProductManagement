const express= require('express');
const router= express.Router();
const {filesUpload} =require('./aws/aws')
const {createUser,userLogin, getUser, updateUser}=require('./controller/userController')
const { createProduct, getProduct, getProductById,updateProduct,deleteProduct} = require('./controller/productController');
const {userValidation, loginUserValidation,updateUserValidation}=require('./validation/userValidation')
const {authentication,authorisation}=require('./auth/auth');
const { createCart, updateCart, getCart,deleteCart} = require('./controller/cartController');
const {createOrder,updateOrder}= require('./controller/orderController')


/*-----------User's API-----------------*/
router.post('/register', filesUpload, userValidation,createUser)
router.post('/login', loginUserValidation,userLogin) 
router.get('/user/:userId/profile',authentication,getUser) 
router.put('/user/:userId/profile',updateUserValidation,authorisation,updateUser)

/*-----------Products's API-----------------*/
router.post('/products', filesUpload, createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

/*-----------Cart's API-----------------*/
router.post('/users/:userId/cart', authentication,authorisation, createCart)
router.put("/users/:userId/cart",authentication,authorisation,updateCart)
router.get("/users/:userId/cart",authentication,authorisation,getCart)
router.delete("/users/:userId/cart",authentication,authorisation,deleteCart)

/*-----------Order's API-----------------*/
router.post('/users/:userId/orders',authentication,authorisation, createOrder)
router.put("/users/:userId/orders",authentication,authorisation,updateOrder)


router.all('/**',function(req,res){
    res.status(404).send({status:false,message:'the api you request, Is not found'})
})

module.exports=router;