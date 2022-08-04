const express = require('express'); //express  is a frame work of node.js web application and it is a labrary  of other node web frame work 
const app = express(); 
const mongoose = require('mongoose');
const multer=require('multer')

const route = require('./routes/route')
app.use(express.json()); // it parses in comming req wit  JSON payload it based on body parser
//app.use(multer().any())

app.use(multer({
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("BAD REQUEST"));
      }
    }
  }).any());
  app.use(function (e, req, res, next) {
    if (e.message == "BAD REQUEST") return res.status(400).send({ status: false, message: "Only .png, .jpg and .jpeg format allowed!" });
    next();
  })


mongoose.connect('mongodb+srv://isuzu:Arjun123@cluster0.rs68oil.mongodb.net/Group64Database')
    .then(() => console.log('MongoDB is Connected'))
    .catch(error => console.log(error));



app.use('/', route);



let PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Express is running on PORT ${PORT}`)
});

