require("dotenv").config();
const bcrypt = require("bcryptjs");
const crud = require("../crud");

/**
 * Module that handles routing for the API
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  // Routing for determining if the user is logged in
  app.get("/api/session/user", (req, res) => {
    res.json(req.user ? req.user : null);
  });

  // Routing for getting requested books during trades
  app.get("/api/session/books", (req, res) => {
    res.json(req.session.books ? req.session.books : null);
  });

  // Routing for users
  app.get("/api/users", (req, res) => {
    crud
      .getUsers()
      .populate({ path: "requests" })
      .then((users) =>
        res.json(
          users.map((user) => {
            console.log(user);
            return {
              _id: user._id,
              username: user.username,
              city: user.city,
              state: user.state,
              books: user.books.length,
              incomingRequests: user.requests.filter(
                (request) => !request.traded
              ).length,
            };
          })
        )
      );
  });

  // Routing for all books
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

  // Routing for displaying a user's profile
  app.get("/api/users/:id", (req, res) =>
    crud.getUser({ _id: req.params.id }).then((user) => {
      if (!user) {
        res.send("Unknown user");
      } else {
        res.json({
          username: user.username,
          fullName: user.name,
          address: user.address,
          city: user.city,
          state: user.state,
          country: user.country,
        });
      }
    })
  );

  // Routing for getting all user's books
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

  // Routing for handling requests
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

  // Routing for displaying all requests for a book
  app.get("/api/books/:bookId/requests", (req, res) => {
    crud
      .getBook(req.params.bookId)
      .populate({ path: "users" })
      .populate({ path: "books" })
      .then((book) => {
        if (!book) {
          res.send("Unknown book");
          return;
        }

        crud.getRequest(book.request).then((request) => {
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
};
