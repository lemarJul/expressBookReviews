const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const router = express.Router();
const JWT_SECRET = "<KEY>";

let users = [];

const isValid = (username) => {
  console.log(users);
  return users.every((user) => user.username !== username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or Password missing" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username, password }, JWT_SECRET, {
      expiresIn: 60 * 60,
    });

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };

    return res
      .status(200)
      .json({ message: "User successfully logged in", data: { accessToken } });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// Add a book review
router.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username; // Assuming middleware sets req.user

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content missing" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully" });
});

router.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Assuming middleware sets req.user

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  delete books[isbn].reviews[username];

  res.json({
    message: `review of ISBN ${isbn} by user ${username} successfully deleted`,
  });
});

module.exports.authenticated = router;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
