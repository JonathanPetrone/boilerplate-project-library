/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require("mongoose");
const { Library } = require("../models");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const BookModel = require("../models").Book;
const LibraryModel = require("../models").Library;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      try {
        const libraryData = await LibraryModel.aggregate([
            { $match: { name: "My library" } },
            { $unwind: "$books" },
            {
                $project: {
                    _id: "$books._id",
                    title: "$books.title",
                    commentcount: "$books.commentcount",
                    comments: "$books.comments"
                }
            }
        ]);

        res.json(libraryData);

        } catch (error) {
        res.json([]);
        }
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if(!title){
        res.send("missing required field title");
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
        res.send("An error occurred while saving the book");
      }
    })
    
    .delete(async function(req, res){

        try {
            const result = await LibraryModel.updateOne(
                { name: "My library" },
                { $set: { books: [] } }
            );

            if (result.nModified > 0) {
                res.send("complete delete successful");
            } else {
                res.send("complete delete successful");
            }
        } catch (error) {
            res.status(500).json({ error: "An error occurred while removing items from 'books' array." });
        }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
      // search for id in books in the library
      // if no book = "no book exists"
      // if book is true = json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
      try {

        const libraryData = await LibraryModel.aggregate([
            { $match: { name: "My library" } },
            { $unwind: "$books" },
            { $match: { "books._id": new ObjectId(bookid) } }
        ]);

        if (libraryData.length > 0) {
            res.json(libraryData[0].books); // Return the matching book
        } else {
            res.send("no book exists");
        }
    } catch (error) {
        res.status(500).json({ error: "no book exists" });
    }
    })
    
    .post(async function(req, res){ 
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if(!comment){
        return res.send("missing required field comment")
      }

      try {
        // Find the book by its ID within the "books" array
        const libraryData = await LibraryModel.findOneAndUpdate(
            {
                name: "My library",
                "books._id": new ObjectId(bookid)
            },
            {
                $push: { "books.$.comments": comment }, // Add the comment
                $inc: { "books.$.commentcount": 1 } // Increment commentcount
            },
            { new: true }
        );

        if (libraryData) {
            // Return the updated book
            const updatedBook = libraryData.books.find(book => book._id.toString() === bookid);
            res.json(updatedBook);
        } else {
            res.send("no book exists");
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred while adding a comment to the book." });
    }
    })

    
    .delete(async function (req, res) {
      let bookid = req.params.id;
    
      try {
        // Check if the book exists in the "My library" with the specified _id
        const book = await LibraryModel.findOne(
          { name: "My library", "books._id": bookid }
        );
    
        if (book) {
          // If the book exists, proceed with the update to remove it
          const result = await LibraryModel.updateOne(
            { name: "My library" },
            { $pull: { books: { _id: bookid } } }
          );
    
          if (result.nModified > 0) {
            return res.send("delete successful");
          } else {
            return res.send("delete successful");
          }
        } else {
          // If the book does not exist, return an appropriate response
          return res.send("no book exists");
        }
      } catch (error) {
        res.status(500).json({ error: "An error occurred while deleting the book." });
      }
    });
};
