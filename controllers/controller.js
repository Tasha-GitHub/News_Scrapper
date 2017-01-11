
// // Import the model (cat.js) to use its database functions.
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
  // router.get("/", function(req, res) {
  //   res.redirect("/");
  // });

  router.get("/", function(req, res) {
    Article.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      //console.log(doc);
      var hbsObject = {
        "newsArticles": doc
      };
    // console.log("handblebars obj");
     //console.log(hbsObject);
       res.render("index", hbsObject);
    }

     });

  });

    //view all saved articles
  router.get("/save/articles", function(req, res) {
    Article.find({saved : true}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      //console.log(doc);
      var hbsObject = {
        "newsArticles": doc
      };
    // console.log("handblebars obj");
     //console.log(hbsObject);
       res.render("saved", hbsObject);
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

  router.get("/notes", function(req, res) {
    Note.find({}, function(error, doc) {
    // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        res.send(doc);
      }
    });
  });

  // Route to see what user looks like without populating
  router.get("/articles", function(req, res) {
    // Find all users in the user collection with our User model
    Article.find({}, function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        res.send(doc);
      }
    });
  });

  // New note creation via POST route
  router.post("/save/articles/:id?", function(req, res) {
    console.log("success");
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": true })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            // Or send the document to the browser
            // res.send(doc);
            console.log("success");
          }
        });
    });

  // // New note creation via POST route
  // router.post("/save/articles:id?", function(req, res) {
  //   // Create a new note and pass the req.body to the entry
  //   var newNote = new Note(req.body);

  //   // And save the new note the db
  //   newNote.save(function(error, doc) {
  //     // Log any errors
  //     if (error) {
  //       console.log(error);
  //     }
  //     // Otherwise
  //     else {
  //       // Use the article id to find and update it's note
  //       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
  //       // Execute the above query
  //       .exec(function(err, doc) {
  //         // Log any errors
  //         if (err) {
  //           console.log(err);
  //         }
  //         else {
  //           // Or send the document to the browser
  //           res.send(doc);
  //         }
  //       });
  //     }
  //   });
  // });

  //   // Grab an article by it's ObjectId
  // router.get("/save/:id", function(req, res) {
  //   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  //   Article.findOne({ "_id": req.params.id })
  //   // ..and populate all of the notes associated with it
  //   .populate("note")
  //   // now, execute our query
  //   .exec(function(error, doc) {
  //     // Log any errors
  //     if (error) {
  //       console.log(error);
  //     }
  //     // Otherwise, send the doc to the browser as a json object
  //     else {
  //       res.json(doc);
  //     }
  //   });
  // });

// Export routes for server.js to use.
module.exports = router;
