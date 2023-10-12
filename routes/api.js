/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const BookModel = require("../models").Book;
const LibraryModel = require("../models").Library;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if(!title){
        res.json({ error: "missing required field title" });
        return;
      }

      const newBook = new BookModel({
        title: title,
        commentcount: 0
      })

      try {
        const libraryData = await LibraryModel.findOne({ name: "My library" }).exec();

        if (!libraryData) {
          const newLibrary = new LibraryModel({ name: "My library" });
          newLibrary.books.push(newBook);
          await newLibrary.save();
          res.json(newBook);
        } else {
          libraryData.books.push(newBook);
          await libraryData.save();
          res.json(newBook);
        }

      } catch (error) {
        console.error("Error saving new book", error);
        res.json({ error: "An error occurred while saving the book" });
      }
      // create a new book with bookschema
      // put it in the "library" by saving the model
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
