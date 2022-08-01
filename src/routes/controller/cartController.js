const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const { isValid,isValidBody,isValidObjectId } = require("../validation/cartValidation")

const createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })

        let userData = await userModel.findById(userId)
        if (!userData) return res.status(404).send({ status: false, message: "user not exist" })

        let productId = req.body.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })

        const product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: false, message: "product not exist" })

        const cart = await cartModel.findOne({userId : userId})
        if(!cart) {
            const data = await cartModel.create({userId : userId, items : [req.body], totalPrice : (product.price * Number(req.body.quantity)), totalItems : 1})
            return res.status(201).json({status : true, data : data})
        }
        let temp = cart.items.filter(Element => {
            if (Element.productId == productId){
                return true
            }
            return false
        })
        if (temp.length > 0){
            return res.status(404).json({status : false, message : "product already added"})
        }
        const data = await cartModel.findOneAndUpdate({userId : userId}, {items : [...cart.items, req.body], totalPrice : cart.totalPrice + (product.price * Number(req.body.quantity)), totalItems : cart.totalItems + 1}, {new : true})

        return res.status(201).json({status : true, data : data}) 
    } catch (error) {
        return res.status(500).json({status : false, message : error.message})
    }
}

module.exports={createCart}
