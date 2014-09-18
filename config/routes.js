var auth = require("./authentication"),
    users = require("../controllers/users"),
    clients = require("../controllers/clients"),
    images = require("../controllers/images"),
    events = require("../controllers/events"),
    mongoose = require("mongoose"),
    encrypt = require("../utilities/encryption"),
    User = mongoose.model("User"),
    Client = mongoose.model("Client"),
    Event = mongoose.model("Event");
var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'testteam.e37@gmail.com',
        pass: 'testing@2012'
    }
});

module.exports = function(app, config) {

  //app.get("/api/users", auth.requiresRole("admin"), users.getUsers);
  app.get("/api/users", users.getUsers);
  app.get("/api/users/:id", users.getUserById);

  app.post("/api/users", users.createUser);
  app.put("/api/users", users.updateUser);
  
  app.get("/api/getempl", function(req, res){
    User.find({roles: ["employee"]}, null, {sort: {created_date: -1}}, function(err, users){
      //console.log(users);
      if (err) {
        res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
      }
      else {
        res.send({"message": "success", "data": users, "status_code": "200"});
      }
    });    
  });
  
  app.post("/api/getmanagerempl", function(req, res){
    var manager_id = req.body.manager_id;
    console.log(manager_id);
    User.find({created_by: manager_id}, null, {sort: {created_date: -1}}, function(err, users){
      if (err) {
        console.log(err);
        res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
      }
      else{
        console.log(users);
        res.send({"message": "success", "data": users, "status_code": "200"});
      }
    });
  });
  
  app.post("/api/forsendmail", function(req, res){
    var email = req.body.email;
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "Team SmartData | <testteam.e37@gmail.com>", // sender address
        to: email, // list of receivers
        subject: "Hello Swapnesh", // Subject line
        text: "Hello world", // plaintext body
        html: "<b>Hello world</b>" // html body
    };    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
  });
  
  // API to update a particular user information
  app.put("/api/users/:id", users.updateUserInfo);
  
  // API for forget Password - 23-07-2014 @Swapnesh
  app.post('/api/forgetpassword', function(req, res){
    var userEmail = req.body.email;
    console.log(userEmail);    
    
    var randomPass = Math.random().toString(36).substring(7);
    console.log(randomPass);

    User.findOne({email: userEmail}, function(err, user){
      if (err) {
        res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
      }
      else{
        user.salt     = encrypt.createSalt();        
        user.password = encrypt.hashPassword(user.salt, randomPass);
        user.save(function(err){
          if (err) return handleError(err);
          else {
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: "Team SmartData | <testteam.e37@gmail.com>", // sender address
                to: userEmail, // list of receivers
                subject: "Password Change Request", // Subject line                
                html: "Your password changed successfully. Your new password is <b>"+randomPass+"</b>." // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                }
            });
            return res.send({"message": "success", "data": user, "status_code": "200"});
          }
        });
      }
    });
  });
  
  // API for employee list - 30-07-2014 @Swapnesh
  app.get('/api/admnemplist', function(req, res){
    User.find({roles: ["employee"]}, function(err, users){
      //console.log(users);
      if (err) {
        res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
      }
      else {
        res.send({"message": "success", "data": users, "status_code": "200"});
      }
    })
  });  

  app.post("/api/login", auth.authenticate);
  app.post("/logout", function( req, res ) {
    req.logout();
    res.end();
  });

  // Create client
  app.post('/api/clients', clients.createClient);
  
  // Get Manager Client List
  app.post('/api/managerclients', clients.getManagerClients);
  
  // Get Admin client list[ALL - Manager+Admin]
  app.get('/api/clients', clients.getAllClients);
  
  // Get Client By Id
  app.get('/api/clientbyid/:id', clients.getClientById);
  
  // Update a client
  app.put('/api/clients', clients.updateClient);
  
  // Create Image
  app.post('/api/imageupload', images.upload);
  
  // Create Events
  app.post('/api/events', events.createEvent);
  
  // Fetch Event List For Admin
  app.get('/api/events', events.getEvents);
  
  // Fetch Event List For Manager
  app.post('/api/managerevents', events.getManagerEvents);
  
  // Fetch Event by ID
  app.get('/api/events/:id', events.getEventById);
  
  // Update and event
  app.put('/api/events', events. updateEvent);
  
  // Save Image
  app.post('/api/fileUpload', images.fileUpload);
  
  // Fetch Time Slot
  app.get('/api/timeslot', users.getTimeSlot);
  
  // Save Time Slot Data
  app.post('/api/timeslot', users.saveTimeSlot);
  
    // Change Password
    app.post('/api/changepassword', function(req, res){
    
      var newPassword = req.body.new_pass;
      var userEmail = req.body.email;
      var userId = req.body._id;

      if ((req.user._id == userId) && (req.user.email == userEmail)  ) {
        User.findOne({email: userEmail}, function(err, user){
          if (err) {
            res.send({"message": "Something went wrong!", "err": err, "status_code": "500"});
          }
          else{
            user.salt     = encrypt.createSalt();        
            user.password = encrypt.hashPassword(user.salt, newPassword);
            user.password_change = true;
            user.save(function(err) {
              if (err)
                  res.send({"message": "error", "data": err, "status_code": "500"});
              else
                  res.send({"message": "success", "data": user, "status_code": "200"});
            });
          }
        });
      }
      else {
        res.send({"message": "Something went wrong!", "err": "Not Authorized", "status_code": "500"});
      }
 
    });
  
  /*
  app.get("*", function( req, res ) {
    res.sendfile( config.interfacePath + '/index.html' );
  });
  */
  
  
};