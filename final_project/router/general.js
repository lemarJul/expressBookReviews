const express = require("express");
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users[username] = { username, password };
  return res.status(201).json({ message: "User registered successfully" });
});

// Promise-based function to get all books
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
};

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Promise-based function to get book by ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Promise-based function to get books by author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      const authorBooks = Object.entries(books)
        .filter(([_, book]) => book.author.toLowerCase() === author.toLowerCase())
        .reduce((acc, [isbn, book]) => {
          acc[isbn] = book;
          return acc;
        }, {});

      if (Object.keys(authorBooks).length > 0) {
        resolve(authorBooks);
      } else {
        reject("No books found for this author");
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const authorBooks = await getBooksByAuthor(author);
    return res.status(200).json(authorBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Promise-based function to get books by title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      const titleBooks = Object.entries(books)
        .filter(([_, book]) => book.title.toLowerCase().includes(title.toLowerCase()))
        .reduce((acc, [isbn, book]) => {
          acc[isbn] = book;
          return acc;
        }, {});

      if (Object.keys(titleBooks).length > 0) {
        resolve(titleBooks);
      } else {
        reject("No books found with this title");
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const titleBooks = await getBooksByTitle(title);
    return res.status(200).json(titleBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Promise-based function to get book reviews
const getBookReviews = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book && book.reviews) {
        resolve(book.reviews);
      } else {
        reject("No reviews found for this book");
      }
    } catch (error) {
      reject(error);
    }
  });
};

//  Get book review
public_users.get("/review/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const reviews = await getBookReviews(isbn);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
