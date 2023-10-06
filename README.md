# Welcome to Library management system
### Start server  - *npm run server*

-**Server running at port 5000**

- **URL:** `/`
- **Method:** GET
- **Summary:** This API route is used for welcoming and checking whether the API methods are working correctly.
- **Description:** This API route is used for welcoming and checking whether the API methods are working correctly.
- **Responses:**
  - **200:** To test the GET method

---

### User Registration

- **URL:** `users/signup`
- **Method:** POST
- **Summary:** User Registration
- **Description:** Register a new user by providing name, email, and password.
- **Request Body:**
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
**500:** Internal server error.

---

### User Login

- **URL:** `/users/login`
- **Method:** POST
- **Summary:** User Login
- **Description:** Authenticate and log in an existing user by providing their email and password.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)

---

### Borrow a Book

- **URL:** `users/borrowBook/:id`
- **Method:** POST
- **Summary:** Borrow a Book
- **Description:** Borrow a book by providing the book ID and user authentication token.
- **Parameters:**
  - `id` (string, path, required): The ID of the book to borrow.
- **Request Body:**
  - `userid` (string, required): User ID

---

### Return a Borrowed Book

- **URL:** `/users/returnBook/:id`
- **Method:** POST
- **Summary:** Return a Borrowed Book
- **Description:** Return a borrowed book by providing the book ID and user authentication token.
- **Parameters:**
  - `id` (string, path, required): The ID of the book to return.
- **Request Body:**
  - `userid` (string, required): User ID
---

### Get List of Books

- **URL:** `/books/getBook`
- **Method:** GET
- **Summary:** Get List of Books
- **Description:** Retrieve a list of books.
- **Security:** Bearer token for user authentication.

### Add a New Book

- **URL:** `/books/addBook`
- **Method:** POST
- **Summary:** Add a New Book
- **Description:** Add a new book to the library database.
- **Security:** Bearer token for user authentication.
- **Request Body:**
  - `ISBN` (string, required, pattern: `^978-[0-9]{2}-[0-9]{5}-[0-9]{2}-[0-9]$`)
  - `title` (string, required)
  - `author` (string, required)
  - `publishedYear` (integer, required)
  - `quantity` (integer, required)
---

### Update Book Information

- **URL:** `/books/updateBook/:isbn`
- **Method:** PATCH
- **Summary:** Update Book Information
- **Description:** Update information for a book using its ISBN.
- **Security:** Bearer token for user authentication.
- **Parameters:**
  - `isbn` (string, path, required): The ISBN of the book to update.
- **Request Body:**
  - `ISBN` (string, required)
  - `title` (string, required)
  - `author` (string, required)
  - `publishedYear` (integer, required)
  - `quantity` (integer, required)
  
### Delete a Book

- **URL:** `/books/deleteBook/:isbn`
- **Method:** DELETE
- **Summary:** Delete a Book
- **Description:** Delete a book using its ISBN.
- **Security:** Bearer token for user authentication.
- **Parameters:**
  - `isbn` (string, path, required): The ISBN of the book to delete.

### Search for Books

- **URL:** `/books/search`
- **Method:** GET
- **Summary:** Search for Books
- **Description:** Search for books by title, author, or ISBN.
- **Security:** Bearer token for user authentication.
- **Parameters:**
  - `data` (string, query, required): The search query (title, author, or ISBN).