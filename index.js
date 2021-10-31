/*
 * Created by Lucas Chapman
 *
 * This project was based on https://manage-a-book-trading-club.freecodecamp.rocks/
 * for the purposes of earning a certificate from freeCodeCamp
 */

require("dotenv").config();

// Express Setup
const express = require("express");
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

// DB Connection
const connectDB = require("./db.config");
connectDB();

// Allows stylesheets, JS scripts, and other files to be loaded
app.use("/css", express.static(process.cwd() + "/public/css"));
app.use("/js", express.static(process.cwd() + "/public/js"));
app.use("/favicon.io", express.static(process.cwd() + "/public/favicon.io"));

// Redirects to the home page
app.get("/", (req, res) => {
  res.redirect("/books");
});

// Displays the home page
app.get("/books", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// Displays the Requests Page
/*app.get("/requests", (req, res) => {
  res.sendFile(process.cwd() + "/public/requests.html");
});*/

// Displays the Create Requests Page
/*app.get("/requests/new", (req, res) => {
  res.sendFile(process.cwd() + "/public/createRequests.html");
});*/

// Displays the Trades Page
/*app.get("/trades", (req, res) => {
  res.sendFile(process.cwd() + "/public/trades.html");
});*/

// Displays the Users Page
/*app.get("/users", (req, res) => {
  res.sendFile(process.cwd() + "/public/users.html");
});*/

// Displays the Login Page
/*app.get("/login", (req, res) => {
  res.sendFile(process.cwd() + "/public/login.html");
});*/

// Displays the Profile Page
/*app.get("/users/:id", (req, res) => {
  res.sendFile(process.cwd() + "/public/profile.html");
});*/

// Displays the Edit Profile Page
/*app.get("/users/edit", (req, res) => {
  res.sendFile(process.cwd() + "/public/edit.html");
});*/

// Displays the My Books Page
/*app.get("/books/my", (req, res) => {
  res.sendFile(process.cwd() + "/public/books.html");
});*/

// Displays the port being used to host the app
const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
