const productModel = require('../model/productModel')
const { isValidBody, isValid, isValidField, isValidNumber, isValidObjectId, isValidString} = require('../validation/productValidation')

const createProduct = async (req, res) => {
    try {
        const data = req.body
        let link = req.link //require from aws file
        data.productImage = link
        if (isValidBody(data)){
            return res.status(400).send({status : false, message : "data Not Found"})
        }

        const {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = data

        if (!isValid(title)){
            return res.status(400).send({status : false, message : "title is required"})
        }

        // if (!isValidField(title)){
        //     return res.status(400).send({status : false, message : "title should only contain alphabets"})
        // }

        const checkTitle = await productModel.findOne({title, isDeleted : false})
        if (checkTitle){
            return res.status(400).send({status : false, message : "title already in use"})
        }

        if (!isValid(description)){
            return res.status(400).send({status : false, message : "description is required"})
        }

        if (!isValid(price)){
            return res.status(400).send({status : false, message : "price is required"})
        }

        if (!isValidNumber(price)){
            return res.status(400).send({status : false, message : "price should only contain numbers"})
        }

        if (!isValid(currencyId)){
            return res.status(400).send({status : false, message : "currencyId is required"})
        }

        if (!currencyId.includes('INR')){
            return res.status(400).send({status : false, message : "currencyId should be INR only"})
        }

        if (!isValid(currencyFormat)){
            return res.status(400).send({status : false, message : "currencyFormat is required"})
        }

        if (!currencyFormat.includes("₹")){
            return res.status(400).send({status : false, message : "currencyFormat should be ₹ only"})
        }

      
        if (style != undefined || style != null){
            if (typeof style != 'string'){
                return res.status(400).send({status : false, message : "style should be in String "})
            }
        }

        if (availableSizes != undefined || availableSizes != null){
            const enumData = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (typeof availableSizes != 'string'){
                return res.status(400).send({status : false, message : "style should be in String "})
            }

            if(!enumData.includes(availableSizes)){
                return res.status(400).send({status : false, message : "availableSizes should be [S, XS, M, X, L, XXL, XL]"})
            }
        }

        if (installments != undefined || installments != null){
            if (!isValidNumber(installments)){
                return res.status(400).send({status : false, message : "installments should be in Number "})
            }
        }

        if (isFreeShipping != undefined || isFreeShipping != null){
            if (isFreeShipping != 'true' && isFreeShipping != 'false'){
                return res.status(400).send({status : false, message : "isFreeShipping should be true or false "})
            }
        }

        const product = await productModel.create(data)
        return res.status(201).send({status : true, message : "Successful", data : product})
    } catch (error) {
        console.log(error)
        return res.status(500).send({status : false, message : error.message})
    }
}


const getProduct = async (req, res) => {
    try {
        const data = req.query
        let {size, name, priceGreaterThan, priceLessThan, priceSort} = data
        let temp = {isDeleted : false}

        if (size != undefined || size != null){
            const enumData = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (typeof size != 'string'){
                return res.status(400).send({status : false, message : "size should be in String "})
            }

            if(!enumData.includes(size)){
                return res.status(400).send({status : false, message : "availableSizes should be S, XS, M, X, L, XXL, XL"})
            }
            temp = {...temp, availableSizes : size}
        }

        if (name != undefined || name != null){
            if (!isValidField(name)){
                return res.status(400).send({status : false, message : "name should only contain alphabets"})
            }
            temp = {title : name, ...temp}
        }

        if (priceGreaterThan != undefined || priceGreaterThan != null){
            if (!isValidNumber(priceGreaterThan)){
                return res.status(400).send({status : false, message : "priceGreaterThan should only contain Numbers"})
            }
        }
        else{
            priceGreaterThan = -Infinity
        }
        
        if (priceLessThan != undefined || priceLessThan != null){
            if (!isValidNumber(priceLessThan)){
                return res.status(400).send({status : false, message : "priceGreaterThan should only contain Numbers"})
            }
        }
        else{
            priceLessThan = Infinity
        }
       
        priceSort = (priceSort)
        if (priceSort != undefined || priceSort != null){
            if ((priceSort) != 1 && (priceSort) != -1){
                return res.status(400).send({status : false, message : "priceSort Should be 1 or -1."})
            }
        }

        let allData = await productModel.find(temp)
        let finalData = []

        for (let i = 0; i < allData.length; i++){
            if(allData[i].price >= Number(priceGreaterThan) && allData[i].price <= Number(priceLessThan)){
                finalData.push(allData[i])
            }
        }
        if ((priceSort) == 1){
            finalData.sort((a, b) => {
                return a.price - b.price
            })
        }
        else {
            finalData.sort((a, b) => {
                return b.price - a.price
            })
        }
        return res.status(200).send({status : true, message : "succesful", dataCount : finalData.length, data : finalData})
    } catch (error) {
        return res.status(500).send({status : false, message : error.message})
    }
}



const getProductById = async (req,res)=>{
    try {
        const productId=req.params.productId
        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productData= await productModel.findOne({_id:productId,isDeleted:false})
        if(!productData) return res.status(404).send({ status: false, message: "product not exist" })

        return res.status(200).send({ status: true,data:productData })


    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })   
    }
}

const updateProduct = async(req, res) => {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)){
            return res.status(400).send({status : false, message : "Invalid product Id"})
        }
        const findProduct=await productModel.findById((productId))
        if(!findProduct) return res.status(400).send({status : false, message : "product not found"})
        if(findProduct.isDeleted==true) return res.status(400).send({status : false, message : "product deleted"})

        const {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = req.body
        if(Object.keys(req.body).length==0)return res.status(400).send({ status: false, message: "Please enter details" });

        let temp = {isDeleted : false}

        if (title != undefined || title != null){
            if (!isValidField(title)){
                return res.status(400).send({status : false, message : "title should be in String"})
            }
            temp = {title : title, ...temp}
        }

        if (description != undefined || description != null){
            if (!isValidField(description)){
                return res.status(400).send({status : false, message : "description should be in String"})
            }
            temp = {...temp ,description : description}
        }

        if (price != undefined || price != null){
            if (!isValidNumber(price)){
                return res.status(400).send({status : false, message : "price should only contain Numbers"})
            }
            temp.price = price
        }

        if (currencyId != undefined || currencyId != null){
            const enumData = ["INR"]
            if (typeof currencyId != 'string'){
                return res.status(400).send({status : false, message : "currencyId should be in String "})
            }

            if(!enumData.includes(currencyId)){
                return res.status(400).send({status : false, message : "currencyId should be [ INR ]"})
            }
            temp.currencyId = currencyId
        }

        if (currencyFormat != undefined || currencyFormat != null){
            const enumData = ["₹"]
            if (typeof currencyFormat != 'string'){
                return res.status(400).send({status : false, message : "currencyFormat should be in String "})
            }

            if(!enumData.includes(currencyFormat)){
                return res.status(400).send({status : false, message : "currencyFormat should be [ ₹ ]"})
            }
            temp.currencyFormat = currencyFormat
        }

        if (isFreeShipping != undefined || isFreeShipping != null){
            if (isFreeShipping != 'true' && isFreeShipping != 'false'){
                return res.status(400).send({status : false, message : "isFreeShipping should be true or false "})
            }
            temp.isFreeShipping = isFreeShipping
        }

        if (style != undefined || style != null){
            if (typeof style != 'string'){
                return res.status(400).send({status : false, message : "style should be in String "})
            }
            temp.style = style
        }

        if (availableSizes != undefined || availableSizes != null){
            const enumData = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (typeof availableSizes != 'string'){
                return res.status(400).send({status : false, message : "availableSizes should be in String "})
            }

            if(!enumData.includes(availableSizes)){
                return res.status(400).send({status : false, message : "availableSizes should be [S, XS, M, X, L, XXL, XL]"})
            }
            temp = {...temp, availableSizes : availableSizes}
        }

        if (installments != undefined || installments != null){
            if (!isValidNumber(installments)){
                return res.status(400).send({status : false, message : "installments should only contain Numbers"})
            }
            temp.installments = installments
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productId, temp, {new : true})
        return res.status(200).send({status : true, message : "Updated Successfully", data : updatedProduct})

    } catch (error) {
        return res.status(500).send({status : false, message : error.message})
    }
}

const deleteProduct = async function (req, res) {
    try {
        let id = req.params.productId
 
        if (!id) return res.status(400).send({status: false, message: "please input currect productId in path param"});
        if(id.length != 24) {return res.status(400).send({status: false, message: "please enter proper length of productId (24)"})};

        let checkProduct = await productModel.findOne({_id: id})
        if (!checkProduct) return res.status(404).send({status: false, message: "no such product exists "});

        let deleteProduct = await productModel.updateOne({ _id: id, isDeleted:false},{$set:{isDeleted: true}, deletedAt : Date.now()}, { new: true });

        if (deleteProduct.modifiedCount == 0) return res.status(400).send({status: false, message: "this product has been deleted already"});
            

        return res.status(200).send({ status: true, message: "This product is deleted successfully", data: deleteProduct})

        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
    }
};

module.exports = {getProductById,createProduct,getProduct,updateProduct,deleteProduct}
