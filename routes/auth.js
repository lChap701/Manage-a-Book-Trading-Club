const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const passport = require("passport");
const auth = require("../auth");
const secretKeys = require("../secretKeys");
const crud = require("../crud");

/**
 * Module that handles routing for OAuth/Passport
 * @module ./routes/auth
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  const oauthOptions = {
    failureRedirect: "/login",
    failureFlash: "Unable to authenticate your account",
    successRedirect: "/books",
  };

  // Finishes setting up Passport
  auth();

  // Displays and handles POST requests for the Book Exchange - Login Page
  app
    .route("/login")
    .get(loggedIn, (req, res) => {
      // Checks if an error message should be displayed
      if (req.session.error) {
        req.session.error = false;
        res.send(req.flash("error")[0]);
      } else {
        res.sendFile(process.cwd() + "/public/login.html");
      }
    })
    .post(
      loggedIn,
      passport.authenticate("local-login", {
        failureRedirect: "/login",
        failureFlash: "Invalid username or password",
        successRedirect: "/books",
      })
    );

  // Displays and handles POST requests for the Book Exchange - Sign Up Page
  app
    .route("/signup")
    .get(loggedIn, (req, res) => {
      res.sendFile(process.cwd() + "/public/signup.html");
    })
    .post(
      passport.authenticate("local-signup", {
        failureRedirect: "/signup",
        failureFlash: "Unable to create your account",
        successRedirect: "/books",
      })
    );

  // Handles GitHub OAuth
  app.get("/auth/github", passport.authenticate("github"));

  // Callback URL for GitHub OAuth
  app.get(
    "/auth/github/callback",
    passport.authenticate("github", oauthOptions)
  );

  // Handles Facebook OAuth
  app.get("/auth/facebook", passport.authenticate("facebook"));

  // Callback URL for Facebook OAuth
  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", oauthOptions)
  );

  // Handles Twitter OAuth
  app.get("/auth/twitter", passport.authenticate("twitter"));

  // Callback URL for Twitter OAuth
  app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", oauthOptions)
  );

  // Handles Google OAuth
  app.get("/auth/google", passport.authenticate("google"));

  // Callback URL for Google OAuth
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", oauthOptions)
  );

  // Handles Microsoft OAuth
  app.get("/auth/microsoft", passport.authenticate("microsoft"));

  // Callback URL for Microsoft OAuth
  app.get(
    "/auth/microsoft/callback",
    passport.authenticate("microsoft", oauthOptions)
  );

  // Displays the Book Exchange - Create Requests Page
  app.get("/requests/new", (req, res) => {
    res.sendFile(process.cwd() + "/public/createRequests.html");
  });

  // Displays and handles PUT requests on the Book Exchange - Edit Profile Page
  app
    .route("/users/edit")
    .get(loggedOut, (req, res) => {
      if (req.session.error) {
        res.send(req.flash("error")[0]);
        req.session.error = false;
      } else {
        res.sendFile(process.cwd() + "/public/editProfile.html");
      }
    })
    .put((req, res) => {
      // Get a secret key for AES encrypting
      const KEY = secretKeys.genKey();

      // Updates the user
      crud
        .updateUser(req.body._id, {
          username: req.body.username,
          email: req.body.email,
          name: req.body.name,
          address:
            req.body.address && req.body.address.length > 0
              ? CryptoJS.AES.encrypt(req.body.address, KEY).toString()
              : req.body.address,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          zipPostal:
            req.body.zipPostal && req.body.zipPostal.length > 0
              ? CryptoJS.AES.encrypt(req.body.zipPostal, KEY).toString()
              : req.body.zipPostal,
          preciseLocation: req.body.preciseLocation == "false" ? false : true,
        })
        .then(() => {
          req.session.error = !secretKeys.updateKey(KEY, user._id.toString());

          if (req.session.error) {
            req.flash("error", "Unable to update your account");
          } else {
            res.redirect("../" + req.body._id);
          }
        })
        .catch((err) => {
          req.flash("error", err);
          req.session.error = true;
        });
    });

  // Displays the Book Exchange - My Books Page
  app.get("/books/my", loggedOut, (req, res) => {
    res.sendFile(process.cwd() + "/public/books.html");
  });

  // Logs the user out
  app.get("/logout", loggedOut, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect("/books");
  });

  /**
   * Checks if the user is logged in and redirects to the home page when logged in
   * @param {*} req           Represents the request
   * @param {*} res           Represents the response
   * @param {Function} next   Function for skipping to the next thing
   * @returns                 Returns next() or nothing
   */
  function loggedIn(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect("/books");
  }

  /**
   * Checks if the user is logged out and redirects to the home page when logged out
   * @param {*} req           Represents the request
   * @param {*} res           Represents the response
   * @param {Function} next   Function for skipping to the next thing
   * @returns                 Returns next() or nothing
   */
  function loggedOut(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/books");
  }
};
