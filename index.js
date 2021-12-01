/*
 * Created by Lucas Chapman
 *
 * This project was based on https://manage-a-book-trading-club.freecodecamp.rocks/
 * for the purposes of earning a certificate from freeCodeCamp
 */

require("dotenv").config();

// Express Setup
const express = require("express");

/**
 * Module that contains the entire application
 * @module ./index
 *
 */
const app = express();

// Cors Setup
const cors = require("cors");
app.use(cors({ origin: "*" }));

// Body-Parser Setup
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helmet Setup
const helmet = require("helmet");
app.use(helmet.xssFilter());
app.use(helmet.noSniff());

// Cookie-Parser Setup
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Express-Session/MemoryStore Setup
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
app.use(
  session({
    name: "store.sid",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24,
      stale: true,
    }),
  })
);

// Connect-Flash Setup
const flash = require("connect-flash");
app.use(flash());

// DB Setup
const connectDB = require("./db.config");
connectDB();
const crud = require("./crud");

// Allows stylesheets, JS scripts, and other files to be loaded
app.use("/css", express.static(process.cwd() + "/public/css"));
app.use("/js", express.static(process.cwd() + "/public/js"));
app.use("/favicon.io", express.static(process.cwd() + "/public/favicon.io"));

// Passport/OAuth Routing
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

const auth = require("./routes/auth");
auth(app);

// API Routing
const api = require("./routes/api");
api(app);

// Session Routing
const sessions = require("./routes/sessions");
sessions(app);

// Redirects to the home page
app.get("/", (req, res) => res.redirect("/books"));

// Displays the home page
app.get("/books", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// Displays the Book Exchange - Requests for (book) Page
app.get("/books/:bookId/requests", (req, res) => {
  res.sendFile(process.cwd() + "/public/bookRequests.html");
});

// Displays the Book Exchange - All Requests Page
app.get("/requests", (req, res) => {
  res.sendFile(process.cwd() + "/public/requests.html");
});

// Form handler for the form on the home page and Book Exchange - My Books page
app.post("/requests/new/books", (req, res) => {
  if (!req.body) return;
  console.log(req.body);
  let ids = [];
  let { books } = req.body;
  books.forEach((bookId) => ids.push(bookId.replace("book", "")));
  req.session.books = ids;
  console.log(req.session.books);
  res.redirect("../new");
});

// Form handler for the Accept Request form on the Book Exchange - Request for (book) Page
app.put("/requests/:requestId/accept", (req, res) => {
  crud.getRequest(req.params.requestId).then((request) => {
    if (!request) {
      res.send("Unknown Request");
      return;
    }

    crud
      .updateRequest(request._id)
      .then(() => res.redirect("/books/my"))
      .catch((ex) => {
        console.log(ex);
        res.send(ex.message);
      });
  });
});

// Form handler for the Cancel Request form on the Book Exchange - Request for (book) Page
app.delete("/requests/:requestId/cancel", (req, res) => {
  crud.getRequest(req.params.requestId).then((request) => {
    if (!request) {
      res.send("Unknown Request");
      return;
    }

    // Updates all books part of the request
    let books = request.giveBooks.concat(request.takeBooks);
    books.forEach((b) => {
      crud.getBook(b).then((book) => {
        book.requests = book.requests.filter((r) => r != request._id);
        book.save();
      });

      if (b == books[books.length - 1]._id) {
        crud
          .deleteRequest(request._id)
          .then(() => res.redirect("/books/my"))
          .catch((ex) => {
            console.log(ex);
            res.send(ex.message);
          });
      }
    });
  });
});

// Displays the Book Exchange - All Trades Page
app.get("/trades", (req, res) => {
  res.sendFile(process.cwd() + "/public/trades.html");
});

// Displays the Book Exchange - Users Page
app.get("/users", (req, res) => {
  res.sendFile(process.cwd() + "/public/users.html");
});

// Displays the Book Exchange - (username)'s Profile Page
app.get("/users/:id", (req, res) => {
  res.sendFile(process.cwd() + "/public/profile.html");
});

// Displays the Book Exchange - (username)'s Books Page
app.get("/users/:id/books", (req, res) => {
  res.sendFile(process.cwd() + "/public/books.html");
});

// Displays the 404 Error Page
app.use((req, res, next) => res.status(404).type("text").send("Not Found"));

// Displays the port being used to host the app
const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

module.exports = app; // for testing purposes
