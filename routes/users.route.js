const express = require('express')
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UserModel } = require('../models/users.model')
const { BookModel } = require('../models/books.model')
const { authenticate } = require('../authenticator/auth')

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: User Registration
 *     description: Register a new user by providing name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       409:
 *         description: User already exists. Please log in.
 *       500:
 *         description: Internal server error.
 */
userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ msg: "User already exists. Please log in." });
  } else {
    try {
      bcrypt.hash(password, 4, async (err, hash) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        const newUser = new UserModel({ name, email, password: hash });
        await newUser.save();

        res.status(201).json({ msg: "New user has been registered" });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
})


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate and log in an existing user by providing their email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful. Returns an access token.
 *       400:
 *         description: Password is incorrect or other client errors.
 *       404:
 *         description: Email does not exist.
 *       500:
 *         description: Internal server error.
 */
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email })
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result) {
          let accessToken = jwt.sign({ id: user[0]._id }, process.env.accessKey, { expiresIn: "5m" })
          res.status(200).send({
            "msg": "Login Succesfull", "AcessToken": accessToken
          })
        } else {
          res.status(400).send({ "msg": "Password is incorrect" })
        }
      })
    } else {
      res.status(404).send({ "msg": "Email does not exist" })
    }
  } catch (error) {
    res.status(400).send({ "error": error.message })
  }
})


/**
 * @swagger
 * /users/borrowBook/{id}:
 *   post:
 *     summary: Borrow a Book
 *     description: Borrow a book by providing the book ID and user authentication token.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the book to borrow.
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: Bearer token for user authentication.
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
 *               userid:
 *                 type: string
 *             required:
 *               - userid
 *     responses:
 *       200:
 *         description: Book successfully borrowed.
 *       400:
 *         description: Invalid request or client errors.
 *       404:
 *         description: Book or user not found.
 *       403:
 *         description: User has borrowed the maximum number of books.
 *       500:
 *         description: Internal server error.
 */

// borrowing a book 
userRouter.post("/borrowBook/:id",authenticate, async (req, res) => {
  const userID = req.body.userid;
  const id = req.params.id;

  try {
    const data = await BookModel.findOne({ _id: id });

    if (!data) {
      return res.status(404).send({ "msg": "Book not found" });
    }

    if (data.quantity === 0) {
      return res.status(200).send({ "msg": "Book is unavailable right now, please come back later" });
    }

    const user = await UserModel.findOne({ _id: userID });

    if (!user) {
      return res.status(404).send({ "msg": "User not found" });
    }

    if (user.borrowedBooks.length >= 3) {
      return res.send({ "msg": "You have borrowed maximum numbers of books, plz return some to add more" })
    }


    const borrowingBook = {
      BookId: id,
      Booktitle: data.title,
      borrowTime: new Date()
    }

    user.borrowedBooks.push(borrowingBook);
    await user.save();

    const newQuantity = Number(data.quantity) - 1;
    const updatedBook = await BookModel.findOneAndUpdate({ _id: id }, { quantity: newQuantity }, { new: true });

    if (!updatedBook) {
      return res.status(404).send({ "msg": "Book not found" });
    }

    res.status(200).send({ "msg": "Book borrowed" });
  } catch (error) {
    res.status(400).send(error.message);
  }
});


/**
 * @swagger
 * /users/returnBook/{id}:
 *   post:
 *     summary: Return a Borrowed Book
 *     description: Return a borrowed book by providing the book ID and user authentication token.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the book to return.
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: Bearer token for user authentication.
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
 *               userid:
 *                 type: string
 *             required:
 *               - userid
 *     responses:
 *       200:
 *         description: Book successfully returned.
 *       400:
 *         description: Invalid request or client errors.
 *       404:
 *         description: Book, user, or borrowed book not found.
 *       500:
 *         description: Internal server error.
 */

// returning a book
userRouter.post("/returnBook/:id",authenticate, async (req, res) => {
  const userID = req.body.userid;
  const id = req.params.id;
  try {
    const data = await BookModel.findOne({ _id: id });

    if (!data) {
      return res.status(404).send({ "msg": "Book not found" });
    }

    const user = await UserModel.findOne({ _id: userID });

    if (!user) {
      return res.status(404).send({ "msg": "User not found" });
    }
    const borrowedBookIndex = user.borrowedBooks.findIndex((book) => book.BookId === id);

    if (borrowedBookIndex === -1) {
      return res.status(404).send({ "msg": "Book is not borrowed by the user" });
    }
    user.borrowedBooks.splice(borrowedBookIndex, 1);
    const returnedBook = {
      BookID: id,
      Booktitle: data.title,
      returnTime: new Date()
    }
    user.returnedBooks.push(returnedBook)
    await user.save();

    const newQuantity = Number(data.quantity) + 1;
    const updatedBook = await BookModel.findOneAndUpdate({ _id: id }, { quantity: newQuantity }, { new: true });

    if (!updatedBook) {
      return res.status(404).send({ "msg": "Book not found" });
    }

    res.status(200).send({ "msg": "Book returned" });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = {
  userRouter
}