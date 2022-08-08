const userModel = require('../model/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { response } = require('express');
const saltRounds = 10;

const createUser = async function (req, res) {
    try {
        let data = req.body
        
        let link = req.link //require from aws file
        data.profileImage = link
        const hash = bcrypt.hashSync(data.password, saltRounds);
        data.password=hash
        const newUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User Created Successfully", data: newUser })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }

};

const userLogin = async function (req, res){
    try {
        const data = req.body
        const {email, password} = data
        const user = await userModel.findOne({email})
        //console.log(user)
        if(!bcrypt.compareSync(password, user.password)){return res.status(404).send({status : false, message : "Password id is Incorrect"})}; // true
        if(!user){return res.status(404).send({status : false, message : "No Registered User Found with this Credential, Please Enter Correct One"})};

        const token = jwt.sign({
        userId : user._id, 
        }, "group64", {expiresIn : "24h"})
        //response.setHeader('x-api-key', token)


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

        const user = await userModel.findById(userId)
        if(!user){return res.status(404).send({status : false, message : "User Not Found"})};
        return res.status(200).send({status : true, message: "User profile details", data : user})
    } catch (error) {
        res.status(500).send({status : false ,message : error.message})   
    }
};

const updateUser = async (req, res) => {
    try {
        const data=req.body
        let userId = req.params.userId;
        //console.log(data)
        if (data.password){
            const securePassword = bcrypt.hashSync(data.password, saltRounds);
            data.password=securePassword 
        }   
        if (!userId){return res.status(400).send({status : false, Message : "please put userId in path param"})};
        if (userId.length != 24) {return res.status(400).send({status: false, message: "please enter proper length of userId (24)"})};
        const updatedUser = await userModel.findByIdAndUpdate(userId, {$set:req.body},{new:true});
        if (!updatedUser){return res.status(400).send({status : false, message : "User Not Exists"})};
        if(updatedUser==null ||updatedUser==undefined) return res.status(404).send({ status: false, msg: "Profile Not found", });
        res.status(200).send({ status: true, msg: "User profile updated", data: updatedUser });
    } catch (error) {
        return res.status(500).send({status : false, message : error.message})
    }
}

module.exports = { createUser, userLogin, getUser, updateUser }