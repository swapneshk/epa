var express = require("express");
var path = require("path");

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var app = express();

var config = require("./config/config")[env];

require("./config/express")(app, config);
require("./config/mongoose")(config);
require("./config/passport")();

require("./config/routes")(app, config);

//app.use(express.static(__dirname + '/controllers/upload'));
//app.use(express.static(__dirname + '/uploads'));
//app.use('/public', express.static(__dirname + '/uploads'));
app.use('/public', express.static(path.join(__dirname, '/uploads')));

app.listen(config.port);
console.log("Listening on port " + config.port + "...");