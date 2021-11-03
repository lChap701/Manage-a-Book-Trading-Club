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

  // Handles GitHub OAuth
  app.get("/auth/github", passport.authenticate("github"));

  // Callback URL for GitHub OAuth
  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/books")
  );

  // Handles Facebook OAuth
  app.get("/auth/facebook", passport.authenticate("facebook"));

  // Callback URL for Facebook OAuth
  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/books")
  );

  // Handles Twitter OAuth
  app.get("/auth/twitter", passport.authenticate("twitter"));

  // Callback URL for Twitter OAuth
  app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/books")
  );

  // Handles Google OAuth
  app.get("/auth/google", passport.authenticate("google"));

  // Callback URL for Google OAuth
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/books")
  );

  // Handles Microsoft OAuth
  app.get("/auth/microsoft", passport.authenticate("microsoft"));

  // Callback URL for Microsoft OAuth
  app.get(
    "/auth/microsoft/callback",
    passport.authenticate("microsoft", { failureRedirect: "/login" }),
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

  // Logs the user out
  app.get(
    "/logout",
    loggedOut,
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      req.logout();
      req.session = null;
      res.redirect("/books");
    }
  );

  /**
   * Checks if the user is logged in and redirects to the home page when logged in
   * @param {*} req           Represents the request
   * @param {*} res           Represents the response
   * @param {Function} next   Function for skipping to the next thing
   * @returns                 Returns next()
   */
  function loggedIn(req, res, next) {
    if (req.user) res.redirect("/books");
    return next();
  }

  /**
   * Checks if the user is logged out and redirects when logged out
   * @param {*} req           Represents the request
   * @param {*} res           Represents the response
   * @param {Function} next   Function for skipping to the next thing
   * @returns                 Returns next()
   */
  function loggedOut(req, res, next) {
    if (!req.user) res.redirect("/books");
    return next();
  }
};
