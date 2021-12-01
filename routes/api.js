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
      .populate({ path: "books" })
      .then((users) => {
        users.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        res.json(
          users.map((user) => {
            return {
              _id: user._id,
              username: user.username,
              city: user.city || "null",
              state: user.state || "null",
              country: user.country || "null",
              books: user.books.length,
              incomingRequests:
                user.books.length > 0
                  ? user.books.reduce(
                      (b1, b2) => b1.numOfRequests + b2.numOfRequests
                    )
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
        .getBooks(user)
        .populate({ path: "requests" })
        .then((books) => {
          if (!books || books.length == 0) {
            res.send("No books have been added yet");
            return;
          }

          books.sort((a, b) => Date.parse(b.bumpedOn) - Date.parse(a.bumpedOn));
          //console.log(books);
          res.json({
            books: books.map((book) => {
              return {
                _id: book._id,
                title: book.title,
                description: book.description,
                addedAt: book.addedAt,
                requests: {
                  count: book.numOfRequests,
                  users: book.requests.map((request) => {
                    return request.giveBooks.map((gb) => gb.user);
                  }),
                },
              };
            }),
            user: {
              username: user.username,
              city: user.city,
              state: user.state,
              country: user.country,
            },
          });
        });
    });
  });

  // Routing for retrieving all books
  app.get("/api/books", (req, res) => {
    crud
      .getAllBooks()
      .populate({ path: "user" })
      .then((books) => {
        books.sort((a, b) => Date.parse(b.bumpedOn) - Date.parse(a.bumpedOn));
        //console.log(books);
        res.json(
          books.map((book) => {
            return {
              _id: book._id,
              title: book.title,
              description: book.description,
              createdAt: book.addedAt,
              requests: {
                _ids: book.requests,
                count: book.numOfRequests,
              },
              user: {
                _id: book.user._id,
                username: book.user.username,
                city: book.user.city,
                state: book.user.state,
                country: book.user.country,
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
        .getRequest(book.request)
        .populate({ path: "books" })
        .populate({ path: "users" })
        .then((request) => {
          if (
            !request ||
            !request.takeBooks.find((book) => book == req.params.bookId)
          ) {
            res.send("There are currently no requests");
            return;
          }

          res.json({
            give: {
              books: request.giveBooks
                .sort((a, b) => b.numOfRequests - a.numOfRequests)
                .map((book) => {
                  return {
                    _id: book._id,
                    title: book.title,
                    description: book.description,
                    requests: book.numOfRequests,
                    user: {
                      _id: book.user._id,
                      username: book.user.username,
                      location:
                        book.user.city +
                        " " +
                        book.user.state +
                        ", " +
                        book.user.country,
                    },
                  };
                }),
            },
            take: {
              books: request.takeBooks
                .sort((a, b) => b.numOfRequests - a.numOfRequests)
                .map((book) => {
                  return {
                    _id: book._id,
                    title: book.title,
                    description: book.description,
                    requests: book.numOfRequests,
                    user: {
                      _id: book.user._id,
                      username: book.user.username,
                      location:
                        book.user.city +
                        " " +
                        book.user.state +
                        ", " +
                        book.user.country,
                    },
                  };
                }),
            },
          });
        });
    });
  });

  // Routing for handling and retrieving requests
  app.route("/api/requests").get((req, res) => {
    let { traded } = req.query;

    // Set to default value
    if (!traded) traded = "false";

    crud
      .getRequests()
      .populate({ path: "giveBooks" })
      .populate({ path: "takeBooks" })
      .then((requests) => {
        res.json(
          requests
            .filter((request) => request.traded.toString() === traded)
            .map((request) => {
              return {
                give: {
                  books: request.giveBooks
                    .sort(
                      (a, b) => Date.parse(b.bumpedOn) - Date.parse(a.bumpedOn)
                    )
                    .map((book) => {
                      return {
                        _id: book._id,
                        title: book.title,
                        description: book.description,
                        requests: book.numOfRequests,
                        user: book.user,
                      };
                    }),
                },
                take: {
                  books: request.takeBooks
                    .sort(
                      (a, b) => Date.parse(b.bumpedOn) - Date.parse(a.bumpedOn)
                    )
                    .map((book) => {
                      return {
                        _id: book._id,
                        title: book.title,
                        description: book.description,
                        requests: book.numOfRequests,
                        user: book.user,
                      };
                    }),
                },
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
