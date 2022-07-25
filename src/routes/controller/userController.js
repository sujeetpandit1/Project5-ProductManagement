const UserModel = require('../model/userModel')
const {isValid, isValidBody,isValidString,isValidPhone,isValidEmail,isValidProfileImage,isValidPassword,isValidAddress,isValidPincode,isValidStreet, isValidObjectId ,isValidCity,isValidField}=require('../validation/validation')
const Bycrypt = require('bcrypt')
const AWS =require('aws-sdk')



const createUser= async function (req, res){
    try {
    let data = req.body
    let link=req.link //require here from aws file
    if (!(link&&link.length)) {
    return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });}
    data.profileImage=link
    const { fname, lname, email, profileImage, phone, password, address}=data
    //validation start
    if(isValidBody(data)){return res.status(400).send({status: false, message: 'Body Cannot Be Blank'})};
    if(!data.fname){return res.status(400).send({status: false, message: 'First Name Key is Required'})}
    if(!isValid(fname)){return res.status(400).send({status: false, message: 'First Name Value is Required'})};
    if(!fname.length >0) {return res.status(400).send({status: false, message: 'First Name Value is Required'})};
    if (!isValidString(fname) && !isValidField(fname)) {
        return res.status(400).send({ status: true, message: "fname should be in alhabets only" })};
    
    if (!isValidString(lname) && !isValidField(lname)) {
        return res.status(400).send({ status: true, message: "lname should't contains numbers and should only contains alhabets" })}
    if(!isValid(lname)){return res.status(400).send({status: false, message: 'Last Name is Required'})};
    
    if(!isValid(email)){return res.status(400).send({status: false, message: 'Email is Required'})};
    if(!isValidEmail(email)){return res.status(400).send({status: false, message: 'Correct email  format is Required'})};
    const uniqueEmail= await UserModel.findOne({email});
    if(uniqueEmail){ return res.status(404).send({status:false, message: `${email} is already present`})};

    if(!isValid(profileImage)){return res.status(400).send({status: false, message: 'Image is Required'})};
    if(!isValidProfileImage(profileImage)){return res.status(400).send({status: false, message: 'Please Select the Profile Image'})};
    
    if(!isValid(phone)){return res.status(400).send({status: false, message: 'Phone is Required'})};
    if(!isValidPhone(phone)){return res.status(400).send({status: false, message: 'Valid Ten Digit Number is Required Starting With 6-9'})};
    const uniquePhone= await UserModel.findOne({phone});
    if(uniquePhone){ return res.status(404).send({status:false, message: `${phone} is already present`})};

    if(!isValid(password)){return res.status(400).send({status: false, message: 'Password is Required'})};
    if(!isValidPassword(password)){return res.status(400).send({status: false, message: 'Password Must Contain Atleast One Alpha Nemeric and Special Character'})};
    
    if(!isValidBody(address)){return res.status(400).send({status: false, message: 'Address Cannot Be Blank'})};
    const { billing, shipping}=address

    let add= function(value){
        if(!isValidBody(value)){return res.status(400).send({status: false, message: `Forgot to Enter ${value}`})};

        let {street, city, pincode}= value

        if(!isValid(street)){return res.status(400).send({status: false, message: 'Street is Required'})};
        if(!isValidStreet(street)){return res.status(400).send({status: false, message: 'Please Enter Valid Street Address'})}; //recheck

        if(!isValid(city)){return res.status(400).send({status: false, message: 'City is Required'})};
        if(!isValidCity(city)){return res.status(400).send({status: false, message: 'Please Enter Valid City Address'})};

        if(!isValid(pincode)){return res.status(400).send({status: false, message: 'Pincode is Required'})};
        if(!isValidPincode(pincode)){return res.status(400).send({status: false, message: 'Please Enter Valid Pincode'})};
    }
    add(shipping)
    add(billing)
    
    const newUser= await UserModel.create(data)
    return res.status(201).send({ status: true, message: "User Created Successfully", data:newUser})
    
} catch (error) {
    res.status(500).send({ status: false, message: error.message})
        
}
    
}



module.exports={createUser}