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
      .populate({ path: "requests" })
      .then((users) =>
        res.json(
          users.map((user) => {
            return {
              _id: user._id,
              username: user.username,
              city: user.city ? user.city : "null",
              state: user.state ? user.state : "null",
              country: user.country ? user.country : "null",
              books: user.books.length,
              incomingRequests: user.requests.filter(
                (request) => !request.traded
              ).length,
            };
          })
        )
      );
  });

  // Routing for displaying a user's profile
  app.get("/api/users/:id", (req, res) =>
    crud.getUser({ _id: req.params.id }).then((user) => {
      if (!user) {
        res.send("Unknown user");
      } else {
        let key = secretKeys.findKey(user._id.toString());
        console.log(key);
        res.json(
          user.preciseLocation
            ? {
                username: user.username,
                fullName: user.name,
                email: user.email,
                address: CryptoJS.AES.decrypt(user.address, key),
                city: user.city,
                state: user.state,
                country: user.country,
                zipPostal: CryptoJS.AES.decrypt(user.zipPostal, key),
              }
            : {
                username: user.username,
                fullName: user.name,
                email: user.email,
                city: user.city,
                state: user.state,
                country: user.country,
              }
        );
      }
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
          console.log(books);

          if (!books || books.length == 0) {
            res.send("No books have been added yet");
            return;
          }

          books.sort((a, b) => b.bumpedOn - a.bumpedOn);

          res.json({
            books: books.map((book) => {
              return {
                _id: book._id,
                title: book.title,
                description: book.description,
                addedAt: book.addedAt,
                requests: {
                  count: book.request.users.filter(
                    (user) => user._id != req.params.id
                  ).length,
                  users: book.request.users.map((user) => {
                    if (user._id != req.params.id) {
                      return {
                        _id: user._id,
                        username: user.username,
                      };
                    }
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
    const { bookId } = req.query;
    let books = [];

    // For when books are requested for trades
    if (bookId) {
      if (Array.isArray(bookId)) {
        bookId.forEach((id) => {
          crud.getBook(id).then((book) => books.push(book));
        });
      } else {
        crud.getBook(bookId).then((book) => books.push(book));
      }

      res.json(books);
      return;
    }

    crud
      .getAllBooks()
      .populate({ path: "users" })
      .then((books) =>
        res.json(
          books
            .sort((a, b) => b.bumpedOn - a.bumpedOn)
            .map((book) => {
              return {
                _id: book._id,
                title: book.title,
                description: book.description,
                user: {
                  _id: book.user._id,
                  username: book.user.username,
                  city: book.user.city,
                  state: book.user.state,
                  country: book.user.country,
                },
                request: book.request,
              };
            })
        )
      );
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
        .populate({ path: "users" })
        .populate({ path: "books" })
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
              books: request.giveBooks.map((book) => {
                return {
                  title: book.title,
                  description: book.description,
                };
              }),
              user: {
                username: request.user[0].username,
                city: request.user[0].city,
                state: request.user[0].state,
                country: request.user[0].country,
                requests: request.user[0].requests.length,
              },
            },
            take: {
              books: request.takeBooks.map((book) => {
                return {
                  title: book.title,
                  description: book.description,
                };
              }),
              users: request.users
                .filter((user) => user._id != request.users[0]._id)
                .map((user) => {
                  return {
                    username: user.username,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    requests: user.requests.length,
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
      .populate({ path: "users" })
      .populate({ path: "books" })
      .then((requests) => {
        res.json(
          requests
            .filter((request) => request.traded.toString() == traded)
            .map((request) => {
              return {
                give: {
                  books: request.giveBooks.map((book) => {
                    return {
                      title: book.title,
                      description: book.description,
                    };
                  }),
                  user: {
                    username: request.user[0].username,
                    city: request.user[0].city,
                    state: request.user[0].state,
                    country: request.user[0].country,
                    requests: request.user[0].requests.length,
                  },
                },
                take: {
                  books: request.takeBooks.map((book) => {
                    return {
                      title: book.title,
                      description: book.description,
                    };
                  }),
                  users: request.users
                    .filter((user) => user._id != request.users[0]._id)
                    .map((user) => {
                      return {
                        username: user.username,
                        city: user.city,
                        state: user.state,
                        country: user.country,
                        requests: user.requests.length,
                      };
                    }),
                },
              };
            })
        );
      });
  });

  // Routing for retrieving countries from around the world
  app.get("/api/countries", (req, res) => {
    const data = locations.getAllCountries();
    console.log(JSON.stringify(data));
    res.json(data);
  });

  // Routing for retrieving a country
  app.get("/api/countries/:cntry", (req, res) => {
    const data = locations.getCountry(req.params.cntry);
    console.log(JSON.stringify(data));
    res.json(data);
  });

  // Routing for retrieving states from a country
  app.get("/api/countries/:cntry/states", (req, res) => {
    const data = locations.getStatesByCountry(req.params.cntry);
    console.log(JSON.stringify(data));
    res.json(data);
  });

  // Routing for retrieving cities in a country
  app.get("/api/countries/:cntry/cities", (req, res) => {
    const data = locations.getCitiesByCountry(req.params.cntry);
    console.log(JSON.stringify(data));
    res.json(data);
  });

  // Routing for retrieving cities in a state
  app.get("/api/countries/:cntry/states/:st/cities", (req, res) => {
    const data = locations.getCitiesByState(req.params.cntry, req.params.st);
    console.log(JSON.stringify(data));
    res.json(data);
  });

  // Routing for retrieving states based on the country and the zip/postal code
  app.get(
    "/api/countries/:cntry/zipPostalCodes/:zipPostal/states",
    (req, res) => {
      const data = locations.getStatesByZipPostalCode(
        req.params.cntry,
        req.params.zipPostal
      );
      console.log(JSON.stringify(data));
      res.json(data);
    }
  );

  // Routing for retrieving cities based on the country and the zip/postal code
  app.get(
    "/api/countries/:cntry/zipPostalCodes/:zipPostal/cities",
    (req, res) => {
      const data = locations.getCitiesByZipPostalCode(
        req.params.cntry,
        req.params.zipPostal
      );
      console.log(JSON.stringify(data));
      res.json(data);
    }
  );

  // Routing for retrieving zip/postal codes based on the country and the state
  app.get(
    "/api/countries/:cntry/states/:st/cities/:city/zipPostalCodes",
    (req, res) => {
      const data = locations.getZipPostalCodes(
        req.params.cntry,
        req.params.st,
        req.params.city
      );
      console.log(JSON.stringify(data));
      res.json(data);
    }
  );

  // Routing for retrieving states from around the world
  app.get("/api/states", (req, res) => {
    const data = locations.getAllStates();
    console.log(JSON.stringify(data));
    res.json(data);
  });
};
