const jwt = require('jsonwebtoken');
const userModel=require('../model/userModel')


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
        let token = req.headers["x-api-key"] || req.headers['authorization'] ;
        if (!token) return res.status(400).send({ status: false, message: "Please, provide the token" });
        const decodedToken = jwt.verify(token, "group64");
        let currentData = req.params.userId;
        let userLoggedIn = decodedToken.userId;
        if (currentData.length !== 24) {return res.status(400).send({ status: false, msg: "Please provide valid user Id" })};
        const fetch = await userModel.findById(currentData);
        const idOfuserId = fetch._id;
        if (userLoggedIn==idOfuserId) {
          next();
        } else {res.status(403).send({ status: "false", msg: "user is not allowed to modify, authorisation required valid token to be preent in header" })};
      } catch (error) {
        res.status(500).send(error.message);
      }
    };
module.exports = { authentication, authorisationUserUpdate }