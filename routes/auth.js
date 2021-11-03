const passport = require("passport");

/**
 * Module that handles routing for OAuth
 * @module ./routes/auth
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  // Displays and handles POST requests for the Book Exchange - Login Page
  app
    .route("/login")
    .get(loggedIn, (req, res) => {
      res.sendFile(process.cwd() + "/public/login.html");
    })

    .post(
      loggedIn,
      passport.authenticate("local", { failureRedirect: "/login" }),
      (req, res) => res.redirect("/books")
    );

  // Displays the Book Exchange - Profile Page
  app.get(
    "/users/:id",
    loggedOut,
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      res.sendFile(process.cwd() + "/public/profile.html");
    }
  );

  // Displays the Book Exchange - Edit Profile Page
  app.get(
    "/users/edit",
    loggedOut,
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      res.sendFile(process.cwd() + "/public/edit.html");
    }
  );

  // Displays the Book Exchange - My Books Page
  app.get(
    "/books/my",
    loggedOut,
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      res.sendFile(process.cwd() + "/public/books.html");
    }
  );

  /**
   * Checks if the user is logged in and redirects when not logged in
   * @param {*} req   Represents the request
   * @param {*} res   Represents the response
   * @param {*} next  Function for skipping to the next thing
   * @returns         Returns nothing or next()
   */
  function loggedIn(req, res, next) {
    if (req.user) res.redirect("/books");
    return next();
  }

  /**
   * Checks if the user is logged out and redirects when not logged out
   * @param {*} req   Represents the request
   * @param {*} res   Represents the response
   * @param {*} next  Function for skipping to the next thing
   * @returns         Returns nothing or next()
   */
  function loggedOut(req, res, next) {
    if (!req.user) res.redirect("/books");
    return next();  
  }
};
