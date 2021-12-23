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
  crud.getBook(req.params.bookId).then((book) => {
    if (book) {
      res.sendFile(process.cwd() + "/public/bookRequests.html");
    } else {
      res.sendStatus(404);
    }
  });
});

// Form handler for the Edit Book form/modal
app.put("/books/:bookId/update", (req, res) => {
  crud.getUser({ _id: req.body.user }).then((user) => {
    if (!user) {
      res.send("Unknown user");
      return;
    }

    if (user.books.indexOf(req.params.bookId) == -1) {
      res.send("User doesn't have book " + req.params.bookId);
      return;
    }

    crud
      .updateBook(req.params.bookId, {
        title: req.body.title,
        description: req.body.description,
      })
      .then(() => res.send("success"))
      .catch((ex) => {
        let error = "Title must be unique";

        if (ex.errors) {
          Object.keys(ex.errors).forEach((field) => {
            if (ex.errors[field]) error = ex.errors[field].message;
          });
        }

        res.send(error);
      });
  });
});

// Form handler for the Delete Book form/modal
app.delete("/books/:bookId/delete", (req, res) => {
  crud.getBook(req.params.bookId).then((book) => {
    if (!book) {
      res.send("Unknown book");
      return;
    }

    crud.getUser({ _id: req.body.user }).then((user) => {
      if (!user) {
        res.send("Unknown user");
        return;
      }

      if (user.books.indexOf(req.params.bookId) == -1) {
        res.send("User doesn't have book " + req.params.bookId);
        return;
      }

      // Deletes all requests/trades that use this book (if any have occurred)
      if (book.requests.length > 0) {
        crud
          .deleteRequests(book.requests)
          .then(() => {
            crud
              .deleteTrades({ $in: book.requests })
              .catch((ex) => console.log(ex));
          })
          .catch((ex) => console.log(ex));
      }

      // Deletes the book
      crud
        .deleteBook(book._id)
        .then(() => {
          // Updates referenced user
          user.books = user.books.filter(
            (b) => b.toString() != book._id.toString()
          );
          user.save();

          res.send("success");
        })
        .catch((ex) => {
          res.send(ex.message);
          console.log(ex.message);
        });
    });
  });
});

// Displays the Book Exchange - All Requests Page
app.get("/requests", (req, res) => {
  res.sendFile(process.cwd() + "/public/requests.html");
});

// Form handler for the main form on the home page and Book Exchange - My Books page
app.post("/requests/new/books", (req, res) => {
  let ids = [];
  let { books } = req.body;
  JSON.parse(books).forEach((bookId) => ids.push(bookId.replace("book", "")));
  req.session.books = ids;
  res.redirect("../new");
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
  crud.getUser({ _id: req.params.id }).then((user) => {
    if (user) {
      res.sendFile(process.cwd() + "/public/profile.html");
    } else {
      res.sendStatus(404);
    }
  });
});

// Displays the Book Exchange - (username)'s Books Page
app.get("/users/:id/books", (req, res) => {
  crud.getUser({ _id: req.params.id }).then((user) => {
    if (user) {
      res.sendFile(process.cwd() + "/public/books.html");
    } else {
      res.sendStatus(404);
    }
  });
});

// Displays the 404 Error Page
app.use((req, res, next) => res.status(404).type("text").send("Not Found"));

// Displays the port being used to host the app
const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

module.exports = app; // for testing purposes
