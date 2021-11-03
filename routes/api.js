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
  app
    .route("/api/users")
    .get((req, res) => {
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
    })
    .post((req, res) => {
      crud.addUser();
    });

  app.route("/api/books").get((req, res) => {
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

  app.route("/api/users/:id").get((req, res) => {
    crud.getUser(req.body.id).then((user) =>
      res.json({
        username: user.username,
        full_name: user.name,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
      })
    );
  });

  app.route("/api/users/:id/books").get((req, res) => {
    crud
      .getBooks(req.body.id)
      .populate({ path: "users" })
      .then((books) =>
        books
          .sort((a, b) => b.bumpedOn - a.bumpedOn)
          .map((book) =>
            res.json({
              _id: book._id,
              title: book.title,
              description: book.description,
              addedAt: book.addedAt,
              user: {
                username: book.user.username,
                city: book.user.city,
                state: book.user.state,
                country: book.user.country,
              },
            })
          )
      );
  });

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
};
