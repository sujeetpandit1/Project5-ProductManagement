const UserModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const createUser = async function (req, res) {
    try {
        let data = req.body
        let link = req.link //require from aws file
        data.profileImage = link
        const password="Generic"
        const salt = await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password, salt)
        data.password=hashedPassword
        const newUser = await UserModel.create(data)
        return res.status(201).send({ status: true, message: "User Created Successfully", data: newUser })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }

};

const userLogin = async(req, res) => {
    try {
        const data = req.body
        const {email, password} = data
        const user = await UserModel.findOne({email})
        let hashPassword=user.password
        const checkPassword= bcrypt.compare(password, hashPassword)
        console.log(checkPassword)
        if(checkPassword==true){let userId=user._id}
        if(!user){return res.status(404).send({status : false, message : "No Registered User Found with this Credential"})};

        const token = jwt.sign({
        userId : user._id, 
        }, "group64", {expiresIn : "24h"})

        return res.status(200).send({status : true, message : "Login Success-Fully", data : {userId : user._id, token : token}});
    } catch (error) {
        res.status(500).send({status : false ,message : error.message})
    }
};


const getUser = async(req, res) => {
    try {
        const userId = req.params.userId
        if (!userId){return res.status(400).send({status : false, Message : "please put userId in path param"})};
        if (userId.length != 24) {return res.status(400).send({status: false, message: "please enter proper length of userId (24)"})};

        const user = await UserModel.findById(userId)
        if(!user){return res.status(404).send({status : false, message : "User Not Found"})};
        return res.status(200).send({status : true, message: "User profile details", data : user})
    } catch (error) {
        res.status(500).send({status : false ,message : error.message})   
    }
};

module.exports = { createUser, userLogin, getUser }