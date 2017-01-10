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
// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function (app) {
	// A GET request to scrape the echojs website
	app.get("/scrape", function(req, res) {
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
	  res.send("Scrape Complete");
	});


};