const express = require('express');
const { BookModel } = require('../models/books.model');
const { authenticate } = require('../authenticator/auth');
const bookRouter = express.Router()

/**
 * @swagger
 * /books/getBook:
 *   get:
 *     summary: Get List of Books
 *     description: Retrieve a list of books.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Bookdata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid request or client errors.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */

// getting all books data
bookRouter.get("/getBook",authenticate, async (req, res) => {
    try {
        const data = await BookModel.find();
        res.status(200).send({ "Bookdata": data })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})

/**
 * @swagger
 * /books/addBook:
 *   post:
 *     summary: Add a New Book
 *     description: Add a new book to the library database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ISBN:
 *                 type: string
 *                 pattern: "^978-[0-9]{2}-[0-9]{5}-[0-9]{2}-[0-9]$"
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               publishedYear:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *             required:
 *               - ISBN
 *               - title
 *               - author
 *               - publishedYear
 *               - quantity
 *     responses:
 *       200:
 *         description: Book added successfully.
 *       400:
 *         description: Invalid request or client errors.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */

// adding/posting a book in book management system
bookRouter.post('/addBook',authenticate, async (req, res) => {
    const { ISBN, title, author, publishedYear, quantity } = req.body;
    const isbnRegex = /^978-[0-9]{2}-[0-9]{5}-[0-9]{2}-[0-9]$/;
    if (!isbnRegex.test(ISBN)) {
        return res.status(400).send({"msg":"Invalid ISBN number, The format schould be like 978-XX-XXXXX-XX-X"})
    }
    const BookAlreadyAvailable = await BookModel.findOne({ ISBN })
    if (BookAlreadyAvailable) {
        return res.status(200).send({ "msg": "Book already available in liabrary data" });
    }
    try {
        const data = new BookModel({ ISBN, title, author, publishedYear, quantity });
        await data.save();
        res.status(200).send({ "msg": "Book data stored succefully" })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})

/**
 * @swagger
 * /books/updateBook/{isbn}:
 *   patch:
 *     summary: Update Book Information
 *     description: Update information for a book using its ISBN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         description: The ISBN of the book to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ISBN:
 *                 type: string
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               publishedYear:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *             required:
 *               - ISBN
 *     responses:
 *       200:
 *         description: Book information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */

// updating book data 
bookRouter.patch('/updateBook/:isbn',authenticate, async (req, res) => {
    const isbn = req.params.isbn;
    const data = req.body;
    try {
      const updatedBook = await BookModel.findOneAndUpdate({ ISBN: isbn },data, { new: true });
      if (!updatedBook) {
        return res.status(404).json({ msg: 'Book not found' });
      }
  
      return res.json(updatedBook);
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

/**
 * @swagger
 * /books/deleteBook/{isbn}:
 *   delete:
 *     summary: Delete a Book
 *     description: Delete a book using its ISBN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         description: The ISBN of the book to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully.
 *       404:
 *         description: Book not found.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */

//   deleting a book form liabrary data
bookRouter.delete('/books/:isbn',authenticate, async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const deletedBook = await Book.findOneAndDelete({ ISBN: isbn });
  
      if (!deletedBook) {
        return res.status(404).json({ msg: 'Book not found' });
      }
  
      return res.status(200).json({ msg: 'Book deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
})

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search for Books
 *     description: Search for books by title, author, or ISBN.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: query
 *         name: data
 *         description: The search query (title, author, or ISBN).
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book(s) found matching the search query.
 *       400:
 *         description: Book not available in the database or invalid request.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */

// search functiuonalioty
bookRouter.get('/search',authenticate, async (req, res) => {
    let data = req.query.data; // Get the search query from the request query string
    try {
      // Use a regular expression to perform a case-insensitive search by title, author, ISBN, or any other criteria
      const Booktitle = await BookModel.findOne({title:data});
      if(!Booktitle){
        const bookAuthor= await BookModel.findOne({author:data});
        if(!bookAuthor){
            const bookISBN=await BookModel.findOne({ISBN:data});
            if(!bookISBN){
                return res.status(400).send("Book is not available in database")
            }else{
                res.status(200).send({"msg":bookISBN})
            }
        }else{
          return  res.status(200).send({"msg":bookAuthor})
        }
      }else{
       return res.status(200).send({"msg":Booktitle})
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

module.exports = {
    bookRouter
}