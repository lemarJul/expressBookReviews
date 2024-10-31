const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const JWT_SECRET = require("./router/auth_users.js").JWT_SECRET;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  console.log(req.session);
  if (req.session && req.session.authorization) {
    const token = req.session.authorization["accessToken"];

    try {
      // Verify the JWT token
      jwt.verify(token, JWT_SECRET, (err, user) => {
        console.log("print-auth", { user });
        if (!err) {
          req.user = user;
          next();
        } else {
          return res
            .status(403)
            .json({ message: "User not authenticated", err });
        }
      });
    } catch (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5050;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () =>
  console.log("Server is running at http://localhost:" + PORT)
);
