require("dotenv").config();
const CryptoJS = require("crypto-js");
const crud = require("../crud");
const secretKeys = require("../secretKeys");
const locations = require("./locations");

/**
 * Module that handles routing for the API
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  // Routing for retrieving all users
  app.get("/api/users", (req, res) => {
    crud
      .getUsers()
      .populate({ path: "books", select: "numOfRequests" })
      .then((users) => {
        if (!users || users.length == 0) {
          res.send("There are currently no users available");
          return;
        }

        users.sort((a, b) => b.createdAt - a.createdAt);
        res.json(
          users.map((user) => {
            return {
              _id: user._id,
              username: user.username,
              city: user.city || "N/A",
              state: user.state || "N/A",
              country: user.country || "N/A",
              books: user.books.length,
              incomingRequests:
                user.books.length > 0
                  ? user.books.reduce((acc, b) => acc + b.numOfRequests, 0)
                  : 0,
              createdAt: user.createdAt,
            };
          })
        );
      });
  });

  // Routing for displaying a user's profile
  app.get("/api/users/:id", (req, res) =>
    crud.getUser({ _id: req.params.id }).then((user) => {
      if (!user) {
        res.send("Unknown user");
        return;
      }

      const data = {
        _id: user._id,
        username: user.username,
        fullName: user.name,
        email: user.email,
        city: user.city,
        state: user.state,
        country: user.country,
      };

      // Displays the encrypted fields
      if (user.preciseLocation) {
        const KEY = secretKeys.findKey(user._id.toString());
        data.address =
          user.address && user.address.length > 0
            ? CryptoJS.AES.decrypt(user.address, KEY).toString(
                CryptoJS.enc.Utf8
              )
            : "";
        data.zipPostalCode =
          user.zipPostal && user.zipPostal.length > 0
            ? CryptoJS.AES.decrypt(user.zipPostal, KEY).toString(
                CryptoJS.enc.Utf8
              )
            : "";
      }

      res.json(data);
    })
  );

  // Routing for retrieving all of a user's books
  app.get("/api/users/:id/books", (req, res) => {
    crud.getUser({ _id: req.params.id }).then((user) => {
      if (!user) {
        res.send("Unknown user");
        return;
      }

      crud
        .getBooks(user._id)
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
            res.send("No books have been added yet");
            return;
          }

          books.sort((a, b) => b.bumpedOn - a.bumpedOn);
          res.json(
            books
              .map((book) => {
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
                  addedAt: book.addedAt,
                  requests: {
                    count: book.numOfRequests,
                    users: users.map((user) => JSON.parse(user)),
                  },
                  user: {
                    _id: user._id,
                    username: user.username,
                    city: user.city || "N/A",
                    state: user.state || "N/A",
                    country: user.country || "N/A",
                  },
                };
              })
          );
        });
    });
  });

  // Routing for retrieving all books
  app.get("/api/books", (req, res) => {
    crud
      .getAllBooks()
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
              createdAt: book.addedAt,
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
      })
      .catch((e) => console.log(e));
  });

  // Routing for retrieving all requests for a book
  app.get("/api/books/:bookId/requests", (req, res) => {
    crud.getBook(req.params.bookId).then((book) => {
      if (!book) {
        res.send("Unknown book");
        return;
      }

      crud
        .getRequests()
        .populate({ path: "giveBooks", populate: { path: "user" } })
        .populate({ path: "takeBooks", populate: { path: "user" } })
        .where("traded")
        .equals(false)
        .where("_id")
        .in(book.requests)
        .where("takeBooks")
        .in(book._id)
        .then((requests) => {
          if (!requests || requests.length == 0) {
            res.json({
              msg: "There are currently no requests at this time",
              bookTitle: book.title,
            });
            return;
          }

          requests.sort((a, b) => b.requestedAt - a.requestedAt);
          res.json(
            requests
              .map((request) => {
                return {
                  _id: request._id,
                  gives: request.giveBooks
                    .sort((a, b) => b.numOfRequests - a.numOfRequests)
                    .map((book) => {
                      return {
                        book: {
                          _id: book._id,
                          title: book.title,
                          description: book.description,
                          requests: book.numOfRequests,
                        },
                        user: {
                          _id: book.user._id,
                          username: book.user.username,
                          city: book.user.city || "N/A",
                          state: book.user.state || "N/A",
                          country: book.user.country || "N/A",
                        },
                      };
                    }),
                  takes: request.takeBooks
                    .sort((a, b) => b.numOfRequests - a.numOfRequests)
                    .map((book) => {
                      return {
                        book: {
                          _id: book._id,
                          title: book.title,
                          description: book.description,
                          requests: book.numOfRequests,
                        },
                        user: {
                          _id: book.user._id,
                          username: book.user.username,
                          city: book.user.city || "N/A",
                          state: book.user.state || "N/A",
                          country: book.user.country || "N/A",
                        },
                      };
                    }),
                  requestedAt: request.requestedAt,
                };
              })
          );
        });
    });
  });

  // Routing for handling and retrieving requests
  app.route("/api/requests").get((req, res) => {
    let { traded } = req.query;

    // Sets default value
    if (!traded) traded = false;

    crud
      .getRequests()
      .populate({ path: "giveBooks", populate: { path: "user" } })
      .populate({ path: "takeBooks", populate: { path: "user" } })
      .populate({
        path: "trade",
        populate: { path: "gaveUser" },
      })
      .populate({
        path: "trade",
        populate: { path: "tookUser" },
      })
      .where("traded")
      .equals(traded)
      .then((requests) => {
        if (!requests || requests.length == 0) {
          if (!traded || traded == "false") {
            res.send("There are currently no requests at this time");
          } else {
            res.send("No trades have taken place at this time");
          }
          return;
        }

        // Sorts based on what is suppose to be displayed
        if (!traded || traded == "false") {
          requests.sort((a, b) => b.requestedAt - a.requestedAt);
        } else {
          requests.sort((a, b) => b.tradedAt - a.tradedAt);
        }

        res.json(
          requests.map((request) => {
            return {
              _id: request._id,
              gives: request.giveBooks
                .sort((a, b) => b.bumpedOn - a.bumpedOn)
                .map((book) => {
                  let user =
                    traded == "true"
                      ? request.trade.gaveUser
                      : request.giveBooks[0].user;
                  return {
                    book: {
                      _id: book._id,
                      title: book.title,
                      description: book.description,
                      requests: book.numOfRequests,
                    },
                    user: {
                      _id: user._id,
                      username: user.username,
                    },
                  };
                }),
              takes: request.takeBooks
                .sort((a, b) => b.bumpedOn - a.bumpedOn)
                .map((book) => {
                  let user =
                    traded == "true"
                      ? request.trade.tookUser
                      : request.takeBooks[0].user;
                  return {
                    book: {
                      _id: book._id,
                      title: book.title,
                      description: book.description,
                      requests: book.numOfRequests,
                    },
                    user: {
                      _id: user._id,
                      username: user.username,
                    },
                  };
                }),
              requestedAt: request.requestedAt,
              tradedAt: request.tradedAt,
            };
          })
        );
      });
  });

  // Routing for retrieving countries from around the world
  app.get("/api/countries", (req, res) => locations.getAllCountries(res));

  // Routing for retrieving a country
  app.get("/api/countries/:cntry", (req, res) => {
    locations.getCountry(res, req.params.cntry);
  });

  // Routing for retrieving addresses in a country
  app.get("/api/countries/:cntry/addresses/:text", (req, res) => {
    locations.getAllAddresses(res, req.params.text, req.params.cntry);
  });

  // Routing for retrieving states from a country
  app.get("/api/countries/:cntry/states", (req, res) => {
    locations.getStatesByCountry(res, req.params.cntry);
  });

  // Routing for retrieving a states from a country
  app.get("/api/countries/:cntry/states/:st", (req, res) => {
    locations.getState(res, req.params.cntry, req.params.st);
  });

  // Routing for retrieving cities in a country
  app.get("/api/countries/:cntry/cities", (req, res) => {
    locations.getCitiesByCountry(res, req.params.cntry);
  });

  // Routing for retrieving cities in a state
  app.get("/api/countries/:cntry/states/:st/cities", (req, res) => {
    locations.getCitiesByState(res, req.params.cntry, req.params.st);
  });

  // Routing for retrieving states based on the country and the zip/postal code
  app.get(
    "/api/countries/:cntry/zipPostalCodes/:zipPostal/states",
    (req, res) => {
      locations.getStatesByZipPostalCode(
        res,
        req.params.cntry,
        req.params.zipPostal
      );
    }
  );

  // Routing for retrieving cities based on the country and the zip/postal code
  app.get(
    "/api/countries/:cntry/zipPostalCodes/:zipPostal/cities",
    (req, res) => {
      locations.getCitiesByZipPostalCode(
        res,
        req.params.cntry,
        req.params.zipPostal
      );
    }
  );

  // Routing for retrieving zip/postal codes based on the country and the state
  app.get(
    "/api/countries/:cntry/states/:st/cities/:city/zipPostalCodes",
    (req, res) => {
      locations.getZipPostalCodes(
        res,
        req.params.cntry,
        req.params.st,
        req.params.city
      );
    }
  );

  // Routing for retrieving states from around the world
  app.get("/api/states", (req, res) => locations.getAllStates(res));

  // Routing for retrieving address from around the world
  app.get("/api/addresses/:text", (req, res) => {
    locations.getAllAddresses(res, req.params.text);
  });
};
