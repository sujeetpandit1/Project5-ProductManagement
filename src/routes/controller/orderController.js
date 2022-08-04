const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const orderModel=require("../model/orderModel")
const { isValid,isValidObjectId } = require("../validation/cartValidation")



const createOrder = async (req, res) => {
    try {
        let userId=req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" });
        let {cancellable, status}=req.body

        let userData = await userModel.findById(userId)
        if (!userData) return res.status(404).send({ status: false, message: "user not exist" })

        let cartData = await cartModel.findOne({userId}).select({items:1, totalPrice:1,totalItems:1,totalQuantity: 1,cancellable: 1, status: 1});
        if(!cartData) return res.status(404).send({ status: false, message: "cart not exist" })
        if(!cartData.items.length) return res.status(400).send({ status: false, message: "your cart not exist" });

        if(cancellable){
            if(typeof cancellable != "boolean") return res.status(400).send({ status: false, message: "cancellable true or false" })};
        if(status){
            let validStatus = ["pending", "completed", "cancelled"]
            if(!validStatus.includes(status)) return res.status(400).send({ status: false, message: "operation should be completed or cancelled" })};

            if(status=="completed" || status=="cancelled")
            return res.status(400).send({ status: false, message: " status should be pending while creating" });

        let quantity=0
        for(let i=0; i<cartData.items.length; i++){
            quantity+=cartData.items[i].quantity
        }
        let newOrder= {
        userId: userId,
        items: cartData.items,
        totalPrice: cartData.totalPrice,
        totalItems: cartData.totalItems,
        totalQuantity: quantity,
        cancellable,
        status}

        const orderCreated= await orderModel.create(newOrder)
        //if order has been created then cart should be empty again
        await cartModel.findOneAndUpdate({userId}, { totalItems: 0, totalPrice: 0, items: [] })
        return res.status(201).send({status: true, message: "order created", data:orderCreated})
        

    } catch (error) {
        return res.status(500).json({status : false, message : error.message})
    }
};

module.exports={createOrder}