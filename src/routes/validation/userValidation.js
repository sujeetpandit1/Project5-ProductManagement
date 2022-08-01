const userModel=require('../model/userModel');
const { isValidAddress } = require('./productValidation');

/*---------------------getUser Validation----------------------*/

const userValidation = async function (req, res, next) {

  const fieldAllowed = ["fname","lname", "email", "phone", "password", "address.shipping.street", "address.shipping.city", "address.shipping.pincode",                 
                          "address.billing.street", "address.billing.city", "address.billing.pincode"];
  let data = req.body;
  
  const keyOf = Object.keys(data);
  //console.log(keyOf)
    const receivedKey = fieldAllowed.filter((x) => !keyOf.includes(x));
    if (receivedKey.length) {return res.status(400).send({ status: "false", msg: `${receivedKey} field is missing` })};

    const { fname, lname, email, phone, password }= data;
  
    if(!fname.trim()){return res.status(400).send({ status: false, message: `fname is invalid or blank` })};
    if (!(/^[A-Za-z]{1,29}$/.test(fname.trim()))) {return res.status(400).send({ status: false, message: `fname is should be in alphabet only` })};
    if(!lname.trim()){return res.status(400).send({ status: false, message: `lname is invalid or blank` })};
    if (!(/^[A-Za-z]{1,29}$/.test(lname.trim()))) {return res.status(400).send({ status: false, message: `lname is should be in alphabet only` })};

    if(!email.trim()){return res.status(400).send({ status: false, message: `email cannot be blank` })};
    if (!(/^\s*[a-zA-Z][a-zA-Z0-9]*([-\.\_\+][a-zA-Z0-9]+)*\@[a-zA-Z]+(\.[a-zA-Z]{2,5})+\s*$/.test(email))) {return res.status(400).send({status: false,message: `${email} should be a valid email address`})};
    let presentEmail = await userModel.findOne({ email: email });
    if (presentEmail) {return res.status(400).send({ status: false, msg: `this ${email} is already used`})};

    if(!phone.trim()){return res.status(400).send({ status: false, message: `phone no. is required` })};
    if (!/^[6789]\d{9}$/.test(phone))return res.status(400).send({status: false,msg: `${phone} is not a valid mobile number, Please enter 10 digit phone number`});
    let duplicatePhone = await userModel.findOne({ phone: phone });
    if (duplicatePhone)return res.status(400).send({ status: false, msg: `${phone} is already registered` });

    if(!password.trim()){return res.status(400).send({ status: false, message: `password is required` })};
    if (!/^\s*(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}\s*$/.test(password.trim()))return res.status(400).send({ status: false, msg: "Password Should Be in Alpha Numeric and Special  Character (length 8-15)" });
  
    if(!data["address.shipping.street"]){return res.status(400).send({ status: false, message: `Shipping Street is required` })};
    // if (!(/^[a-zA-Z0-9/,.]+/.test(data["address.shipping.street"]))) {return res.status(400).send({ status: false, message: `Shipping Street Contain Specific Address` })};

    if(!data["address.shipping.city"].trim()){return res.status(400).send({ status: false, message: `Shipping City is required` })};
    // if (!(/^[A-Za-z]/.test(data["address.shipping.city"]))) {return res.status(400).send({ status: false, message: `Shipping City Contain Alphabet only` })};

    if(!data["address.shipping.pincode"].trim()){return res.status(400).send({ status: false, message: `Shipping Pin Code is required` })};
    if (!/^\s*[123456789][0-9]{5}/.test(data["address.shipping.pincode"]))return res.status(400).send({ status: false, msg: "Shipping Pin Code Should be in Numbers Only and Should Not Start with 0" });

    if(!data["address.billing.street"].trim()){return res.status(400).send({ status: false, message: `Billing Street is required` })};
    // if (!(/^([a-zA-Z0-9[!@#$%^&*] -])/.test(data["address.billing.street"]))) {return res.status(400).send({ status: false, message: `Billing Street Contain Specific Address` })};

    if(!data["address.billing.city"].trim()){return res.status(400).send({ status: false, message: `Billing City is required` })};
    // if (!(/^[A-Za-z]/.test(data["address.billing.city"]))) {return res.status(400).send({ status: false, message: `Billing City Contain Alphabet only` })};

    if(!data["address.billing.pincode"].trim()){return res.status(400).send({ status: false, message: `Billing Pin Code is required` })};
    if (!/^\s*[123456789][0-9]{5}\s*$/.test(data["address.billing.pincode"]))return res.status(400).send({ status: false, msg: "Billing Pin Code Should be in Numbers Only and Should Not  Start with 0" });

    next();
  };

  /*---------------------userLogin Validation----------------------*/
  
  const loginUserValidation = async function (req, res, next) {
    const credentials = ["email", "password"];
    let data = req.body;
    const keyOf = Object.keys(data);
    const output = credentials.filter((x) => !keyOf.includes(x));
    if (output.length) {return res.status(400).send({ status: "false", msg: `${output} is required to process` })};

    const {email, password}= data;
    if(!email.trim()){return res.status(400).send({ status: false, message: `email is required` })};
    if(!password.trim()){return res.status(400).send({ status: false, message: `password is required` })};
    
    

    next()
   
  };

  const updateUserValidation = async function (req, res, next) {
    let data=req.body
    
    if (data.fname?.length == 0)return res.status(400).send({ status: false, message: "Please enter valid input to update fname" });
    if (!(/^[A-Za-z]{1,29}$/.test(data.fname?.trim()))) {return res.status(400).send({ status: false, message: `fname is should be in alphabet only` })};
    if (data.lname?.length == 0)return res.status(400).send({ status: false, message: "Please enter valid input to update lname" });
    if (!(/^[A-Za-z]{1,29}$/.test(data.lname?.trim()))) {return res.status(400).send({ status: false, message: `fname is should be in alphabet only` })};

    if(data.email?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid Email For Update` })};
    if(data.phone?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid phone number For Update` })};
    if(data.password?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid password For Update` })};

    const shippingStreet = data["address.shipping.street"]
    if(shippingStreet?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid shipping street For Update` })};
    const shippingCity = data["address.shipping.city"]
    if(shippingCity?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid shipping City For Update` })};
    const shippingPincode = data["address.shipping.pincode"]
    if(shippingPincode?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid shipping pincode For Update` })};

    const billingStreet = data["address.billing.street"]
    if(billingStreet?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid billing street For Update` })};
    const billingCity = data["address.billing.city"]
    if(billingCity?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid billing City For Update` })};
    const billingPincode = data["address.billing.pincode"]
    if(billingPincode?.length == 0){return res.status(400).send({ status: false, message: `Please input Valid billing pincode For Update` })};

  
    

    next()
  };


  
module.exports={userValidation, loginUserValidation, updateUserValidation}