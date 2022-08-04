const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const orderModel=require("../model/orderModel")
const { isValid,isValidObjectId,isValidBody } = require("../validation/orderValidation")


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

    const updateOrder = async function(req, res) {
        try{
            const userId = req.params.userId
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" });

            const findUser = await userModel.findById(userId);
            if (!findUser) return res.status(404).send({ status: false, message: 'User not found.' });
                            
            let data = req.body
            if (isValidBody(data)) return res.status(400).send({ status: false, message: "Please enter your details to update." });

            const {orderId, status} = data
            if (!isValid(orderId)) return res.status(400).send({ status: false, messege: "Please provide OrderId" });

            if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "ProductId is invalid" });

            const findOrder = await orderModel.findById(orderId);
            if (!findOrder) return res.status(400).send({ status: false, message: 'Order Id is incorrect.' });
    
            if(!isValid(status))return res.status(400).send({status:false, message: "Valid status is required. [completed, pending, cancelled]"});
    
            if(status === 'pending'){
                if(findOrder.status === 'completed') return res.status(400).send({status:false, message: "Order can not be updated to pending. because it is completed."});
                if(findOrder.status === 'cancelled') return res.status(400).send({status:false, message: "Order can not be updated to pending. because it is cancelled."});
                if(findOrder.status === 'pending') return res.status(400).send({status:false, message: "Order is already pending."});
            }
    
            if(status === 'completed'){
                if(findOrder.status === 'completed') return res.status(400).send({status:false, message: "Order is already completed."});

                const orderStatus = await orderModel.findOneAndUpdate({ _id: orderId}, 
                    {$set: { items: [], totalPrice: 0, totalItems: 0, totalQuantity: 0, status }},{new:true});
                return res.status(200).send({status: true, message: "order completed successfully", data: orderStatus})
            }
    
            if(status === 'cancelled'){
                if(findOrder.cancellable == false) return res.status(400).send({status:false, message:"Item can not be cancelled, because it is not cancellable."});
                if(findOrder.status === 'cancelled') return res.status(400).send({status:false, message: "Order is already cancelled."});

                const findOrderAfterDeletion = await orderModel.findOneAndUpdate({ userId: userId },
                    {$set: {items: [], totalPrice: 0, totalItems: 0, totalQuantity : 0, status : 'cancelled' }},{new:true})
                return res.status(200).send({status: true, message: "Order is cancelled successfully", data: findOrderAfterDeletion})
            }
        }
        catch(err) {
            return res.status(500).send({status : false, message : error.message})
        }
    }
    

module.exports={createOrder, updateOrder}
