require("dotenv").config();
const CryptoJS = require("crypto-js");
const passport = require("passport");
const auth = require("../auth");
const secretKeys = require("../secretKeys");
const crud = require("../crud");
const notificationHandler = require("../notificationHandler");

/**
 * Module that handles routing for OAuth/Passport
 * @module ./routes/auth
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  const oauthOptions = {};

  // Finishes setting up Passport
  auth();

  // Displays and handles POST/PUT requests for the Book Exchange - Login Page
  app
    .route("/login")
    .get(loggedIn, (req, res) => {
      // Checks if an error message should be displayed (when not using OAuth)
      if (req.session.error) {
        req.session.error = false;
        res.send(req.flash("error")[0]);
      } else {
        oauthOptions.successRedirect = "/books";
        oauthOptions.failureRedirect = req.originalUrl;
        oauthOptions.failureFlash = "Unable to authenticate your account";
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
    )
    .put((req, res) => {
      res.sendFile(process.cwd() + "/public/login.html");
    });

  // Displays and handles POST requests for the Book Exchange - Sign Up Page
  app
    .route("/signup")
    .get(loggedIn, (req, res) => {
      req.session.newUser = true;
      oauthOptions.successRedirect = "/books";
      oauthOptions.failureRedirect = req.originalUrl;
      oauthOptions.failureFlash = "This account has already been used";
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
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  // Callback URL for Google OAuth
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", oauthOptions)
  );

  // Displays and handles POST requests for the Book Exchange - Create Requests Page
  app
    .route("/requests/new")
    .get(loggedOut, (req, res) => {
      res.sendFile(process.cwd() + "/public/createRequests.html");
    })
    .post((req, res) => {
      const { gives, takes } = req.body;

      if (!gives || gives.length == 0) {
        res.send("Request must include at least one book to give");
        return;
      }

      if (!takes || takes.length == 0) {
        res.send("Request must include at least one book to take");
        return;
      }

      crud
        .addRequest({
          giveBooks: gives,
          takeBooks: takes,
        })
        .then((request) => {
          // Update referenced books and gets referenced users
          crud
            .getAllBooks()
            .where("_id")
            .in(gives.concat(takes))
            .then((books) => {
              books.forEach((book) => {
                if (takes.find((b) => b == book._id)) ++book.numOfRequests;
                book.requests.push(request);
                book.save();
              });

              // Updates the new request
              request.requestedAt = new Date();
              request.save();

              // Removes books from session
              delete req.session.books;

              console.log(
                books.find((book) => String(book.user) != String(req.user._id))
                  .user
              );

              // Send notifications
              const notifications = [
                {
                  message: "Sent request",
                  user: req.user._id,
                },
                {
                  message: `Recieved request from ${req.user.username}`,
                  user: books.find(
                    (book) => String(book.user) != String(req.user._id)
                  ).user,
                },
              ];
              notifications.forEach((notification) => {
                notificationHandler.addToRequests({
                  message: notification.message,
                  user: notification.user,
                });
              });

              // Displays success message
              req.flash("success", "Created Request");
              req.session.success = true;
              res.redirect("/requests");
            });
        })
        .catch((ex) => {
          res.send(ex.message);
        });
    });

  // Displays available books to select to be given/taken during trade requests
  app.get("/requests/new/books/select", loggedOut, (req, res) => {
    const { to } = req.query;

    // Displays an error message
    if (to != "give" && to != "take" && to) {
      res.send("'to' should be unset or set to 'give' or 'take'");
      return;
    }

    // Get books based on 'to'
    const filter = to != "take" ? req.user._id : { $ne: req.user._id };
    crud
      .getBooks(filter)
      .populate({ path: "user" })
      .populate({
        path: "requests",
        match: { traded: { $eq: false } },
        populate: { path: "giveBooks", populate: { path: "user" } },
      })
      .then((books) => {
        // Gets only requests for books that users wish to take
        books.forEach((book) => {
          book.requests = book.requests.filter((request) =>
            request.takeBooks.find((tb) => String(tb) == String(book._id))
          );
        });

        // Checks if any books are available
        if (!books || books.length == 0) {
          res.send("There are currently no books available");
          return;
        }

        books.sort((a, b) => b.bumpedOn - a.bumpedOn);
        res.json(
          books.map((book) => {
            // Converts the objects to string to stay unique
            let users = [
              ...new Set(
                book.requests.map((request) => {
                  return JSON.stringify({
                    _id: request.giveBooks[0].user._id.toString(),
                    username: request.giveBooks[0].user.username,
                  });
                })
              ),
            ];

            return {
              _id: book._id,
              title: book.title,
              description: book.description,
              requests: {
                count: book.numOfRequests,
                users: users.map((user) => JSON.parse(user)),
              },
              user: {
                _id: book.user._id,
                username: book.user.username,
                city: book.user.city || "N/A",
                state: book.user.state || "N/A",
                country: book.user.country || "N/A",
              },
            };
          })
        );
      });
  });

  // Routing for allowing requests to be accepted and books to be traded
  app.get("/requests/:requestId/accept/:id", loggedOut, (req, res) => {
    crud
      .getRequest(req.params.requestId)
      .populate({ path: "giveBooks" })
      .populate({ path: "takeBooks" })
      .then((request) => {
        if (!request) {
          res.sendStatus(404);
          return;
        }

        // Gets books part of the request
        const { giveBooks, takeBooks } = request;
        let acceptedBooks = takeBooks.filter(
          (tb) => tb.user.toString() == req.params.id
        );

        // Updates all users that have accepted the request
        crud
          .getUsers()
          .where("_id")
          .in([giveBooks[0].user, req.params.id])
          .then((users) => {
            users.forEach((user) => {
              let remove =
                user._id.toString() == giveBooks[0].user.toString()
                  ? new Set(giveBooks.map((book) => book._id.toString()))
                  : new Set(acceptedBooks.map((book) => book._id.toString()));
              let add =
                user._id.toString() == giveBooks[0].user.toString()
                  ? acceptedBooks.map((book) => book._id)
                  : giveBooks.map((book) => book._id);
              user.books = user.books.filter(
                (book) => !remove.has(book.toString())
              );
              user.books.push(...add);
              user.save();
            });
          });

        // Updates all books part of the request
        crud
          .getAllBooks()
          .where("_id")
          .in(giveBooks.concat(takeBooks).map((b) => b._id))
          .then((books) => {
            books.forEach((book) => {
              if (
                takeBooks.find((tb) => String(tb.user) == String(book.user))
              ) {
                --book.numOfRequests;
              }

              book.user =
                book.user.toString() == req.params.id
                  ? giveBooks[0].user
                  : acceptedBooks[0].user;
              book.save();
            });
          });

        // Adds the trade to the DB
        crud
          .addTrade({
            gaveUser: acceptedBooks[0].user,
            tookUser: giveBooks[0].user,
            request: request._id,
          })
          .then((trade) => {
            // Updates the request
            request.traded = true;
            request.trade = trade;
            request.tradedAt = new Date();
            request.save();

            // Send notifications
            const notifications = [
              { message: "Accepted request", user: req.params.id },
              {
                message: `Traded books with ${req.user.username}`,
                user: giveBooks[0].user,
              },
            ];
            notifications.forEach((notification) => {
              notificationHandler
                .addToTrades({
                  message: notification.message,
                  user: notification.user,
                })
                .catch((err) => console.log(err));
            });

            req.session.success = true;
            req.flash("success", "Accepted Request");
            res.redirect("/requests");
          })
          .catch((ex) => {
            console.log(ex);
            res.send(ex.message);
          });
      });
  });

  // Routing for cancelling requests and declining trades
  app.get("/requests/:requestId/cancel", loggedOut, (req, res) => {
    crud
      .getRequest(req.params.requestId)
      .populate({ path: "giveBooks" })
      .populate({ path: "takeBooks" })
      .then((request) => {
        if (!request) {
          res.sendStatus(404);
          return;
        }

        // Updates all books part of the request
        crud
          .getAllBooks()
          .where("_id")
          .in(request.giveBooks.concat(request.takeBooks).map((b) => b._id))
          .then((books) => {
            books.forEach((book) => {
              if (String(book.user) == String(request.takeBooks[0].user)) {
                --book.numOfRequests;
              }
              book.requests = book.requests.filter(
                (r) => r.toString() != request._id.toString()
              );
              book.save();
            });
          });

        // Deletes the request
        crud
          .deleteRequest(request._id)
          .then(() => {
            // Send notifications
            const notifications = [
              { message: "Cancelled request", user: req.user._id },
              {
                message: `${req.user.username} cancelled their request`,
                user: request.takeBooks[0].user,
              },
            ];
            notifications.forEach((notification) => {
              notificationHandler
                .addToRequests({
                  message: notification.message,
                  user: notification.user,
                })
                .catch((err) => console.log(err));
            });

            res.redirect("..");
          })
          .catch((ex) => {
            console.log(ex);
            res.send(ex.message);
          });
      });
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
        })
        .then(() => {
          req.session.error =
            req.body.address &&
            req.body.address.length > 0 &&
            req.body.zipPostal &&
            req.body.zipPostal.length > 0
              ? !secretKeys.updateKey(KEY, req.body._id)
              : false;

          if (req.session.error) {
            req.flash("error", "Unable to update your account");
          } else {
            notificationHandler
              .addToUsers({
                message: "Updated your account",
                user: req.body._id,
              })
              .catch((err) => console.log(err));

            res.redirect("/users/" + req.body._id);
          }
        })
        .catch((err) => {
          req.flash("error", err);
          req.session.error = true;
        });
    });

  // Displays the Book Exchange - Notifications Page
  app.get("/users/notifications", loggedOut, (req, res) => {
    res.sendFile(process.cwd() + "/public/notifications.html");
  });

  // Displays and handles PUT/DELETE requests on the Book Exchange - Settings Page
  app
    .route("/users/settings")
    .get(loggedOut, (req, res) => {
      oauthOptions.successRedirect = req.originalUrl;
      oauthOptions.successFlash = "Your changes have been saved";
      oauthOptions.failureRedirect = req.originalUrl;
      oauthOptions.failureFlash = "This account has already been used";
      res.sendFile(process.cwd() + "/public/settings.html");
    })
    .put((req, res) => {
      crud.getUser({ _id: req.body._id }).then((user) => {
        if (!user) {
          res.send("Unknown user");
          return;
        }

        crud
          .updateUser(user._id, {
            preciseLocation: req.body.preciseLocation,
            emailNotifications: req.body.emailNotifications,
          })
          .then(() => res.send("Your changes have been saved"))
          .catch((err) => res.send(err));
      });
    })
    .delete((req, res) => {
      crud
        .getUser({ _id: req.body._id })
        .populate({ path: "books" })
        .then((user) => {
          if (!user) {
            res.send("Unknown user");
            return;
          }

          // Get all requests that include the user
          let requests = [];
          user.books.forEach((book) => {
            requests.push(...book.requests.map((request) => String(request)));
          });
          requests = [...new Set(requests)];

          // Updates all books part of requests that include the user
          crud
            .getAllBooks()
            .where("requests")
            .in(requests)
            .where("_id")
            .nin(user.books.map((book) => book._id))
            .then((books) => {
              books.forEach((book) => {
                if (book.numOfRequests > 0) --book.numOfRequests;
                book.requests = book.requests.filter(
                  (request) => !requests.includes(request.toString())
                );
                book.save();
              });
            });

          // Deletes everything tied to the account
          crud.deleteAllAuth(user._id).catch((ex) => console.log(ex));
          crud.deleteBooks(user._id).catch((ex) => console.log(ex));
          crud.deleteRequests(requests).catch((ex) => console.log(ex));
          crud.deleteNotifications(user._id).catch((ex) => console.log(ex));

          // Deletes the user's account
          crud
            .deleteUser(user._id)
            .then(() => {
              secretKeys.removeKey(user._id.toString());
              res.redirect("/books");
            })
            .catch((ex) => res.send(ex));
        });
    });

  // Routing for unlinking authenticated accounts from a user's account
  app.get("/users/:id/unlink/:authId", loggedOut, (req, res) => {
    crud.getUser({ _id: req.params.id }).then((user) => {
      if (!user) {
        res.send("Unknown user");
        return;
      }

      crud
        .deleteAuth(req.params.authId)
        .then(() => {
          user.accounts = user.accounts.filter(
            (account) => String(account) != req.params.authId
          );
          user.save();

          notificationHandler
            .addToSecurityUpdates({
              message: "Removed Linked Accounts",
              user: user._id,
            })
            .catch((err) => console.log(err));

          req.session.success = true;
          res.redirect("/users/settings");
        })
        .catch((err) => res.send(err));
    });
  });

  // Displays and handles POST requests on the Book Exchange - My Books Page
  app
    .route("/books/my")
    .get(loggedOut, (req, res) => {
      res.sendFile(process.cwd() + "/public/myBooks.html");
    })
    .post((req, res) => {
      crud.getUser({ _id: req.body.user }).then((user) => {
        if (!user) {
          res.send("Unknown user");
          return;
        }

        crud
          .addBook(req.body)
          .then((book) => {
            user.books.push(book);
            user.save();

            notificationHandler
              .addToBooks({
                message: `Added book ${book.title}`,
                user: user._id,
              })
              .catch((err) => console.log(err));

            res.send("success");
          })
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
