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

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const {cartId, productId, removeProduct} = req.body
        
        if (Object.keys(userId) == 0) {return res.status(400).send({status: false, message: "Please provide user id in path params"})}
        if (!isValidObjectId(userId)) {return res.status(400).send({status: false, message: "Please provide a valid User Id"})}
        if (!isValid(cartId)) {return res.status(400).send({status: true, message: "Please provide cart id in body"})}
        if (!isValidObjectId(cartId)) {return res.status(400).send({status: false, message: "Please provide a valid Cart Id"})}
        if (!isValid(productId)) {return res.status(400).send({status: true, message: "Please provide cart id in body"})}
        if (!isValidObjectId(productId)) {return res.status(400).send({status: false, message: "Please provide a valid Product Id"})}
        if (!isValid(removeProduct)) {return res.status(400).send({status: true, message: "Please provide cart id in body"})}
        
        let cart = await cartModel.findById({ _id: cartId })
        if (!cart) return res.status(404).send({ status: false, msg: "Cart not found" });

        if (cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, msg: "Cart is empty" });
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });

        let cartMatch = await cartModel.findOne({userId: userId})
        if (!cartMatch) return res.status(401).send({status: false, message: "This cart doesnot belong to you. Please check the input"});

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) return res.status(404).send({ status: false, msg: "Product not found" });
        
        if (removeProduct == 0) {
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    const productPrice = product.price * cart.items[i].quantity
                    const updatePrice = cart.totalPrice - productPrice
                     cart.items.splice(i, 1)
                    const updateItems = cart.totalItems - 1
                    const updateItemsAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cart.items, totalPrice: updatePrice, totalItems: updateItems },{new:true})
                    return res.status(200).send({ status: true, msg: "Succesfully Updated in the cart", data: updateItemsAndPrice })
                }

            }
        } else if (removeProduct == 1){
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    const updateQuantity = cart.items[i].quantity - 1
                    if (updateQuantity < 1) {
                        const updateItems = cart.totalItems - 1
                        const productPrice = product.price * cart.items[i].quantity
                        const updatePrice = cart.totalPrice - productPrice
                         cart.items.splice(i, 1)
                        
                        const updateItemsAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cart.items, totalPrice: updatePrice, totalItems: updateItems },{new:true})
                        return res.status(200).send({ status: true, msg: "Product has been removed successfully from the cart", data: updateItemsAndPrice })

                    } else {
                        cart.items[i].quantity = updateQuantity
                        const updatedPrice = cart.totalPrice - (product.price * 1)
                        const updatedQuantityAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items:cart.items,totalPrice: updatedPrice },{new:true})
                        return res.status(200).send({ status: true, msg: "Quantity has been updated successfully in the cart", data: updatedQuantityAndPrice })
                    }
                }
            }
        }

    } catch(error) {
        res.status(500).send({ status: false, msg: error.msg })
    }
}
