
// // Import the model (cat.js) to use its database functions.
// var burger = require("../models/burger.js");

// ===============================================================================
// DEPENDENCIES
// We need to include the path package to get the correct file path for our html
// ===============================================================================
var path = require('path');
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
var Article = require("../models/article.js");
var mongojs = require("mongojs");
// Requiring our Note and Article models
var Note = require("../models/note.js");
var express = require("express");
var router = express.Router();


// ===============================================================================
// ROUTING
// ===============================================================================
  router.get("/", function(req, res) {
    res.redirect("/articles");
  });

  router.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      console.log(doc);
      var hbsObject = {
        "newsArticles": doc
      };
    // console.log("handblebars obj");
     console.log(hbsObject);
       res.render("index", hbsObject);
    }

     });

  });


// A GET request to scrape the echojs website
  router.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.reddit.com/r/webdev/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every h2 within an article tag, and do the following:
      $(".title").each(function(i, element) {

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("a").text();
        result.link = $(this).children("a").attr("href");
        //console.log($(this).children("a"));

        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });

      });
    });
    // Tell the browser that we finished scraping the text
    res.redirect("/articles");
  });


// // Create all our routes and set up logic within those routes where required.
// router.get("/", function(req, res) {
//   res.redirect("/burgers");
// });

// router.get("/burgers", function(req, res) {
//   burger.all(function(data) {
//     var hbsObject = {
//       burgers: data
//     };
//     console.log("handblebars obj")
//     console.log(hbsObject);
//     res.render("index", hbsObject);
//   });
// });

// router.post("/burgers/create", function(req, res) {
//   burger.create([
//     "burger_name"
//   ], [
//     req.body.name
//   ], function() {
//     res.redirect("/burgers");
//   });
// });

// router.put("/burgers/update/:id", function(req, res) {
//   var condition = "id = " + req.params.id;

//   // console.log("condition", condition);
//   // console.log("request");
//   // console.log(req.body.devoured);

//   burger.update({
//     devoured: true
//   }, condition, function() {
//     res.redirect("/burgers");
//   });
// });

// router.delete("/burgers/delete/:id", function(req, res) {
//   var condition = "id = " + req.params.id;

//   burger.delete(condition, function() {
//     res.redirect("/burgers");
//   });
// });

// Export routes for server.js to use.
module.exports = router;
