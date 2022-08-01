const { isValidObjectId } = require("mongoose")
const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")

const createCart = async (req, res) => {
    try {
        const userId = req.params.userId
        const data = req.body

        if (!isValidObjectId(userId)){
            return res.status(400).send({status : false, message : "Invalid User Id"})
        }

        const checkUser = await userModel.findById({_id : userId})

        if (!checkUser){
            return res.status(400).send({status : false, message : "User Not Found"})
        }

        const checkCart = await cartModel.findOne({userId : userId})
        let cart = {}
        console.log(checkCart)
        if (!checkCart){
            cart[userId] = userId
            cart[items] = []
            cart[totalPrice] = 0
            cart[totalItems] = 0
            checkCart = await cartModel.create(cart)
        }

        //const data = req.body

        const {productId, quantity} = data

        const checkProduct = await productModel.findById({_id : productId})

        if (!checkProduct){
            return res.status(400).send({status : false, message : "Product doesn't exists"})
        }
        console.log([...checkCart.items, data])

        let temp = await cartModel.findByIdAndUpdate({_id : checkCart._id}, {items : [... checkCart.items, data], totalItems : checkCart.totalItems+Number(quantity), totalPrice : checkCart.totalPrice+(checkProduct.price*Number(quantity))}, {new : true})

        console.log(temp)
        return res.status(200).send({status : true, data : temp})

    } catch (error) {
        return res.status(500).send({status : false, message : error.message})
    }
}

module.exports.createCart = createCart