var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var mongoose = require("mongoose");

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static("public"));
// Set up express app to handle data parsing
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    // useMongoClient: true
  });
} else {
  mongoose.connect("mongodb://@localhost:27017/homework14mongo-db", {
    // useMongoClient: true
  });
}

// Uncomment Below when ready to connect to Mongo

var databaseUrl = "scraper";
var collections = ["scrapedData"];
// Hook mongojs config to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error: ", error);
});

// Uncomment above when ready to connect to Mongo


// Import routes and give server access
var routes = require("./controllers/artController.js");

app.use(routes);

app.listen(port, function () {
  console.log("App listening on port" + port + "!");
});