const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  comments: [],
  title: { type: String, required: true },
  commentcount: Number
});

const Book = mongoose.model("Book", bookSchema);

exports.Book = Book;