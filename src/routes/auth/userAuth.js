const jwt = require('jsonwebtoken');
const userModel=require('../model/userModel')
const { isValidBody, isValid, isValidField, isValidObjectId} = require('../validation/productValidation')


const authentication = async (req, res, next) => {
    try {
        let bearerToken = req.headers['authorization'];
        if (!bearerToken) return res.status(400).send({ status: false, message: "Please, provide the token" });


        let bearer = bearerToken.split(' ')
        let token = bearer[1];

        let decodedToken = jwt.verify(token, "group64");
        if (!decodedToken) return res.status(403).send({ status: false, message: "Incorrect Token" })

        next();


    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};




const authorisationUserUpdate = async function (req, res, next) {
    try {
      let bearerToken= req.headers['authorization'];
        if(!bearerToken) return res.status(400).send({ status: false, message: "Please, provide the token" });

    let bearer = bearerToken.split(' ')
    let token = bearer[1];
    
    let userId=req.params.userId
    
    if(!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "UserId is Not Valid" });
      }
      const findUser = await userModel.findById({_id:userId})
      //console.log(findUser)
      if(!findUser){
        return res.status(404).send({ status: false, message: "User not found" });
      }

     let decodedToken = jwt.verify(token, "group64");
    if(!decodedToken) return res.status(403).send({ status: false, message: "Incorrect Token" })
    
    if (decodedToken.userId != findUser._id)
      return res.status(401).send({ status: false, msg: "authorization failed,You don't have  access"});
      next(); //if match then move the execution to next
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  };

module.exports = { authentication, authorisationUserUpdate }