const mongoose = require('mongoose')

const isValid = (value) => {
    if(typeof value === "undefined" || typeof value === "null") return false;
    if(typeof value === "string" && value.trim().length == 0) return false;
    return true; 
  }
  const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
} 


const isValidBody = (data) => {
  return Object.keys(data).length == 0;
}
 module.exports={isValid,isValidBody,isValidObjectId}