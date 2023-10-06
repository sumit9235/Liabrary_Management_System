const mongoose = require('mongoose');

// Define the book schema
const bookSchema = new mongoose.Schema({
  ISBN: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publishedYear: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
},{
  versionKey:false
});

// Create a Book model using the bookSchema
const BookModel = mongoose.model('Book', bookSchema);

module.exports ={BookModel}
