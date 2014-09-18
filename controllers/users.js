var User = require("mongoose").model("User"),
    encrypt = require("../utilities/encryption"),
    Timeslot = require("mongoose").model("Timeslot"),
    formidable = require('formidable');

exports.getUsers = function( req, res ) {
  User.find({}).exec(function(err, collection) {
    res.send(collection);
  });
};

exports.createUser = function( req, res, next ) {
  console.log(req.body);
  var userData = req.body;
  userData.email    = userData.email.toLowerCase();
  userData.salt     = encrypt.createSalt();
  userData.password = encrypt.hashPassword(userData.salt, userData.password);

  User.create(userData, function(err, user) {
    if (err) {
      if (err.toString().indexOf('E11000') > -1) {
        err = new Error("That email is already part of this system.");
      }
      res.status(400);
      return res.send({ reason: err.toString() });
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      res.send(user);
    });
  });
};

exports.updateUser = function( req, res ) {
  console.log("--UPDATE USER--");
  var user = req.body;
 
  User.findOneAndUpdate({_id: req.body._id}, user, function(err, user){
    if (err) {
      res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
    }
    else{
      res.send({"message": "success", "data": user, "status_code": "200"});
    }
  });
};

/* 
exports.updateUser = function( req, res ) {
  var user = req.body;
 
  User.findOne({_id: req.body._id}, function(err, user){
    if (err) {
      res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
    }
    else{        
      user.email = req.body.email;
      user.first_name = req.body.first_name;
      user.last_name = req.body.last_name;
      user.address.line1 = req.body.address.line1;
      user.address.line2 = req.body.address.line2;
      user.address.city = req.body.address.city;
      user.address.state = req.body.address.state;
      user.address.zip = req.body.address.zip;
      user.phone = req.body.phone;
      console.log("--UPDATE PROFILE--");
      console.log(user);
      user.save(function(err){
        if (err) return handleError(err);
        else return res.send({"message": "success", "data": user, "status_code": "200"});
      });
    }
  });
};
*/

exports.getUserById = function( req, res ) {
  req.params.id = req.params.id.substring(1);
  User.findOne({ _id:req.params.id }).exec(function(err, user) {
    res.send(user);
  });
};

exports.updateUserInfo = function(req, res) {  
  var data = req.body;
  console.log("--EMPLOYEE DATA EDIT--");
  console.log(data);
  delete data['password'];
  //console.log(data);
  //return false;
  //data.salt = encrypt.createSalt();
  //data.password = encrypt.hashPassword(data.salt, req.body.password);
  console.log(data);
  User.update({_id: req.body._id},data, {upsert: true}, function(err, result){
  if (err) {
    console.log(err);
  }
  else {
    res.send({"message": "success", "data": data, "status_code": "200"});
  }
  })
  /*User.findOne({_id: req.body._id}, function(err, user){
    if (err) {
      res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
    }
    else {      
      User(data).save(function(err){
        if (err) return handleError(err);
        else return res.send({"message": "success", "data": user, "status_code": "200"});
      });
    }
  });*/
};

// Get Time Slot Data
exports.getTimeSlot = function(req, res){
  Timeslot.find({}).exec(function(err, collection) {
    res.send(collection);
  });
};

exports.saveTimeSlot = function(req, res){
  
  if (!req.body._id) {
    Timeslot.create(req.body, function(err, slot) {
      if (err) {
        res.send({"err": err});
      }
      else {
        console.log("slot saved");
        console.log(slot);
        res.send({"message": "success", "data": slot, "status_code": "200"});
      }
    });
  }
  else if (req.body._id) {
    Timeslot.findOneAndUpdate({_id: req.body._id}, req.body, function(err, slot){
      if (err) {
        res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
      }
      else{
        res.send({"message": "success", "data": slot, "status_code": "200"});
      }
    });
  }
  else {
    res.send({"message": "error", "data": "error", "status_code": "500"});
  }
  
};