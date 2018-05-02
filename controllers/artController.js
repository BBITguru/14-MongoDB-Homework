var express = require("express");
// var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");
var router = express.Router();
const DEBUG = true;

var Article = require("../models/Article");

const log = (outputString) =>{
  if(DEBUG) console.log(outputString);
}

router.get("/", function(req, res){
  res.render("index");
});

router.get("getArticles", function(req, res) {

 // connection.query("SELECT * FROM tasks;", function(err, data) {
    //   if (err) throw err;
  
      // Test it
      // log('The solution is: ', data);
  
      // Test it
      // res.send(data);
    console.log("Calling for articles");
    Article.find({}).then(articles => {
              
        res.send({articles:articles});
      
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });

  router.get("/scrape", function(req, res) {
    // Make a request for the news section of ycombinator
    log("Inside scrape function.");
    var articles = [];
    var result = {};
    

    axios.get("https://www.washingtonpost.com/").then(function(response) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(response.data);
      // For each element with a "title" class

        $(".moat-trackable").each(function(i, element) {
            // $(".headline").each(function(i, element){
            result = {};
            // // Save the text and href of each link enclosed in the current element
            if( $(element).attr("moat-id") == "homepage/story" &&
            $(element).children("div").children("div").children(".headline").children("a").attr("href")){
            // log();
            
            //     log("Title: " + $(element).children("div").children("div").children(".headline").children("a").text());
            //     log("Link: " + $(element).children("div").children("div").children(".headline").children("a").attr("href"));
                
            //     if($(element).children("div").children("div").children(".blurb").text() != ""){
            //         log("Description: " + $(element).children("div").children("div").children(".blurb").text());
            //     }
            //     log();


                result.title =  $(element).children("div").children("div").children(".headline").children("a").text();
                result.link = $(element).children("div").children("div").children(".headline").children("a").attr("href");
                if($(element).children("div").children("div").children(".blurb").text() != ""){
                    result.description =  $(element).children("div").children("div").children(".blurb").text();
                } else{
                    result.description = "";
                }

               articles.push(result);

            }//End If of article

        });
        // log("Articles = " + articles);
       
        res.send({articles:articles});
    });
});


router.post("/article", function(req,res)
{
    Article.create(req.body)
    .then(function(){
        res.status(200).send("Article Created");
    })
});

router.delete("/deleteArticle/:id",function(req,res)
{
    console.log("In Delete Article");
    Article.deleteOne({_id:req.params.id})
    .then(function(){
        console.log("Article Deleted");
        res.status(200).send("Article Deleted")
    })
    .catch(function(err){res.json(err)})
});

router.post("/addNote",function(req,res){

    console.log("PATH: /addNote");
    console.log("       articleID: " + req.body.articleID);
    console.log("       note: " + req.body.note);

    Article.update({_id: req.body.articleID},{$push:{notes: req.body.note}})
    .then(function(){ 
        console.log("Note added to Article.");
        res.status(200).send("Note Added to Article");
    })
    .catch(function(err){res.json(err)})
});

router.delete("/deleteNote",function(req,res){

    console.log("PATH: deleteNote");
    console.log("   ArticleID: " + req.body.articleID);
    console.log("   Note: " + req.body.note);

    Article
    .update({_id: req.body.articleID},{$pull:{notes: req.body.note}})
    .then(function(){
        console.log("Note removed from Arictle.");
        res.status(200).send("Note removed from Article");
    })
    .catch(function(err){res.json(err)})
});

router.get("/getArticle/:id",function(req,res){
    console.log("In Get Article");
    Article.findOne({_id:req.params.id})
    .then(function(article){
        res.status(200).send(article);
    })
    .catch(function(err){
        res.status(404).json(err);
    })
});


  // Export routes for server.js to use.
module.exports = router;