const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const { isValid,isValidObjectId } = require("../validation/cartValidation")

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

        let quantity=req.body.quantity
        if(!quantity){quantity=1}

        quantity=Number(quantity)
        if(quantity.toString()=='NaN'){
            return res.status(400).send({status:false,message:"It's not a number"})
        }
       if(quantity%1!=0){
        return res.status(400).send({status:false,message:"It's should be in integer not in decimal"})
       }

        if(!cart) {
            const data = await cartModel.create({userId : userId, items : [{productId,quantity}], totalPrice : (product.price *quantity), totalItems : 1})
            return res.status(201).json({status : true, data : data})
        }
        if (cart) {
          
            cart.totalPrice = (product.price * quantity) + cart.totalPrice
            let k=null
            for(let i in cart.items){
                if(cart.items[i].productId==productId){
                    k=i ;
                    break
                }}
            if(k){cart.items[k].quantity+=quantity}
            
            
            else{  
                cart.items.push({ productId, quantity })
                // cart.totalItems +=1
                cart.totalItems=cart.items.length
            }}
        // let temp = cart.items.filter(Element => {
        //     if (Element.productId == productId){
        //         return true
        //     }
        //     return false
        // })
        //     if (temp.length > 0){
        //     return res.status(404).json({status : false, message : "product already added"})
        // }
        const data = await cartModel.findOneAndUpdate({userId : userId},cart, {new : true}).select({__v:0})

        return res.status(201).json({status : true, data : data}) 
    } catch (error) {
        return res.status(500).json({status : false, message : error.message})
    }
}



const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        
        const {cartId, productId, removeProduct} = req.body
        let cart = {}
        
       // if (Object.keys(userId) == 0) {return res.status(400).send({status: false, message: "Please provide user id in path params"})}
        if (!isValidObjectId(userId)) {return res.status(400).send({status: false, message: "Please provide a valid User Id"})}

        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });
        
        if(isValid(cartId)){
        if (!isValidObjectId(cartId)) {return res.status(400).send({status: false, message: "Please provide a valid Cart Id"})}
            cart = await cartModel.findById({ _id: cartId })
            if (!cart) return res.status(404).send({ status: false, msg: "Cart not found" });
        }else{
            return res.status(400).send({status: true, message: "Please provide cart id in body"});
        }




        if(productId){
            // console.log(cart.items)
            let upd = cart.items
            if (!isValid(productId)) {return res.status(400).send({status: true, message: "Please provide productId id in body"})}
            if (!isValidObjectId(productId)) {return res.status(400).send({status: false, message: "Please provide a valid Product Id"})}
            let product = await productModel.findOne({ _id: productId, isDeleted: false });
            if (!product) return res.status(404).send({ status: false, msg: "Product not found" });
            if (removeProduct||removeProduct==0){
                if (!isValid(removeProduct)) {return res.status(400).send({status: true, message: "Please provide removeproduct in body"})}
               cart.items = cart.items.filter(obj => {
                    if (obj.productId == productId){
                        if(Number(removeProduct) == 0){
                            cart.totalItems -= 1
                            cart.totalPrice -= obj.quantity*product.price
                            return false
                        }
                        // if(cart.totalPrice < 0) cart.totalPrice=0 
                        
                        if(Number(removeProduct) < 0 ){
                            
                            cart.totalPrice = cart.totalPrice - product.price
                            obj.quantity -= 1 //decrease quantity by -1
                            //obj.quantity += Number(removeProduct) // to decrease specific quantity
                            // console.log(obj.quantity<=0)
                            if(obj.quantity <= 0){
                                cart.totalItems-=1
                                return false
                            } 

                            
                        }
                       
                      
                        // if(Number(removeProduct) > 0 ){
                        //     cart.totalPrice = cart.totalPrice - product.price
                        //     obj.quantity += 1 //add quantity by 1
                            //obj.quantity += Number(removeProduct) // to add specific quantity
                        //}
                    }

                    return true
                })
                
            }
           

            const data = await cartModel.findByIdAndUpdate(req.body.cartId, {items : cart.items, totalItems : cart.totalItems, totalPrice : cart.totalPrice}, {new : true})

            return res.status(200).send({status : true, message : data})
        }
         if (cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, msg: "Cart is empty" });
        
        let cartMatch = await cartModel.findOne({userId: userId})
        if (!cartMatch) return res.status(401).send({status: false, message: "This cart doesnot belong to you. Please check the input"});

        return res.status(200).send({status : true, message : cart})

    } catch(error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        // if (Object.keys(userId) == 0) {
        //     return res.status(400).send({ status: false, message: "userId is required" })
        // }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        const getData = await cartModel.findOne({ userId: userId }).select({ _id: 0 }).populate('items.productId', 'title price productImage isFreeShipping');
        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        return res.status(200).send({ status: true, message: "cart details", data: getData })


    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}


const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        // if (Object.keys(userId) == 0) {
        //     return res.status(400).send({ status: false, message: "userId is required" })
        // }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        const cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        let cart = { totalItems: 0, totalPrice: 0, items: [] }
        const deleteCart = await cartModel.updateOne({ userId: userId }, cart, { new: true })
        return res.status(204).send({ status: true, message: "cart empty", data: deleteCart })


    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}





module.exports={createCart, updateCart,getCart,deleteCart}