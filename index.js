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

// Express-Session Setup
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, value: "" },
    httpOnly: false,
    key: "express.sid",
  })
);

// DB Setup
const connectDB = require("./db.config");
connectDB();

// Allows stylesheets, JS scripts, and other files to be loaded
app.use("/css", express.static(process.cwd() + "/public/css"));
app.use("/js", express.static(process.cwd() + "/public/js"));
app.use("/favicon.io", express.static(process.cwd() + "/public/favicon.io"));

// API Routing
const api = require("./routes/api");
api(app);

// Passport/OAuth Routing
const auth = require("./routes/auth");
auth(app);

// Redirects to the home page
app.get("/", (req, res) => {
  res.redirect("/books");
});

// Displays the home page
app.get("/books", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// Displays the Book Exchange - Requests Page
app.get("/requests", (req, res) => {
  res.sendFile(process.cwd() + "/public/requests.html");
});

// Displays the Book Exchange - Create Requests Page
app.get("/requests/new", (req, res) => {
  res.sendFile(process.cwd() + "/public/createRequests.html");
});

// Displays the Book Exchange - Trades Page
app.get("/trades", (req, res) => {
  res.sendFile(process.cwd() + "/public/trades.html");
});

// Displays the Book Exchange - Users Page
app.get("/users", (req, res) => {
  res.sendFile(process.cwd() + "/public/users.html");
});

// Displays a 404 page
app.use((req, res, next) => {
  res.status(404).type("text").send("Not Found");
});

// Displays the port being used to host the app
const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
