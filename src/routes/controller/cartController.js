const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const { isValid,isValidBody,isValidObjectId } = require("../validation/cartValidation")



const createCart = async(req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })

        let userData = await userModel.findOne({ _id: userId})
        if (!userData) return res.status(404).send({ status: false, message: "user not exist" })

        let cartId = req.body.cartId

        let cartData = null
        if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" })
            cartData = await cartModel.findOne({ _id: cartId}).lean()
            if (!cartData) return res.status(404).send({ status: false, message: "cart not exist,create one" })
            if(cartData.userId!=userId) return res.status(403).send({status:false,message:"cartId is not matching respective userId"})

        }
        if (isValidBody(req.body)) return res.status(400).send({ status: false, message: "body can't be empty" })
        let { productId, quantity } = req.body
       
        let filter = {}

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        
        if (!productData) return res.status(404).send({ status: false, message: "product not exist" })


        if (!isValid(quantity)) quantity = 1
        
        if (quantity < 1 || !Number.isInteger(Number(quantity)) || isNaN(quantity)) return res.status(400).send({ status: false, message: "Quantity of item(s) should be a an integer & > 0." })
        
        const cartExist=await cartModel.findOne({userId})

        if (cartData) {
            quantity=Number(quantity)
            cartData.totalPrice = (productData.price * quantity) + cartData.totalPrice
            let k=null
            for(let i in cartData.items){
                if(cartData.items[i].productId==productId){
                    k=i ;
                    break
                }}
            if(k){cartData.items[k].quantity+=quantity}
            
        
            else{ cartData.items.push({ productId, quantity })}
            cartData.totalItems = cartData.items.length
            cartData=await cartModel.findByIdAndUpdate(cartId,cartData,{new:true})

            return res.status(201).send({ satus: true, data: cartData })

        } else {
           
            if(cartExist) return res.status(400).send({status:false,message:"one cart already exist"})
           
            filter.userId = userId
            filter.items=[{productId,quantity}]
            filter.totalPrice = productData.price * quantity
            filter.totalItems = 1

            let cartData = await cartModel.create(filter)
            return res.status(201).send({ satus: true, data: cartData })

        }



    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })

    }
}
module.exports={createCart}