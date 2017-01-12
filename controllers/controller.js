
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
  router.get("/", function(req, res) {
    Article.find({saved : false}, function(error, doc) {
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

  router.get("/article/notes", function(req, res) {
    // TODO
    // =====
    Article.find({}).populate("note").exec(function(error, doc){
      if (error) {
          res.send(error);
        }
        // Or, send our results to the browser, which will now include the books stored in the library
        else {
          res.send(doc);
        }

    });
  });

    //view all saved articles
  router.get("/save/articles", function(req, res) {
    Article.find({saved : true}).populate("note").exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        //console.log(doc);
        var hbsObject = {
          "newsArticles": doc,
          "notes": doc.notes
        };
        // console.log("handblebars obj");
       //console.log(hbsObject);
        res.render("saved", hbsObject);
        console.log(hbsObject)
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
    res.redirect("/");
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
    //console.log("success");
        // Use the article id to find and update it's note
    Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": true })
        // Execute the above query
    .exec(function(err, doc) {
          // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/");
      }
    });
  });

    // New note creation via POST route
  router.post("/remove/articles/:id?", function(req, res) {
    //console.log("success");
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            //console.log("success");
            console.log(doc);
            res.redirect("/save/articles");
          }
        });
  });


    // New note deletion via POST route
  router.post("/delete/note/:id?", function(req, res) {
    //console.log("success");
        // Use the article id to find and update it's note
        Note.remove({ "_id": req.params.id })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            //console.log("success");
            console.log(doc);
            //not working yet
            res.redirect("/save/articles");
          }
        });
  });


  // New note creation via POST route
  router.post("/save/note/:id?", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);
    console.log(req.body)

    // And save the new note the db
    newNote.save(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Otherwise
      else {
        // Find our user and push the new note id into the User's notes array
        Article.findOneAndUpdate({"_id": req.params.id}, { $push: { "note": doc._id } }, { new: true }, function(err, newdoc) {
          // Send any errors to the browser
          if (err) {
            res.send(err);
          }
          // Or send the newdoc to the browser
          else {
            res.send(newdoc);
          }
        });
      }
    });
  });

// Export routes for server.js to use.
module.exports = router;
