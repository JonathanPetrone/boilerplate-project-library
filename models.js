const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  comments: [],
  title: { type: String, required: true },
  commentcount: Number
});

const Book = mongoose.model("Book", bookSchema);

const librarySchema = new Schema({
    books: [bookSchema]
});

const Library = mongoose.model("Library", librarySchema);

exports.Book = Book;
exports.Library = Library;