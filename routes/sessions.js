const crud = require("../crud");

/**
 * Routing for accessing session data
 * @module ./routes/session
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = (app) => {
  // Routing for determining if the user is logged in
  app.get("/session/user", (req, res) => {
    res.json(
      req.user
        ? {
            _id: req.user._id,
            username: req.user.username,
            hasPassword: Boolean(req.user.password),
            preciseLocation: req.user.preciseLocation,
          }
        : null
    );
  });

  // Routing for getting requested books during trades
  app.get("/session/books", (req, res) => {
    if (!req.session.books || req.session.books.length == 0) {
      res.json({
        gives: [{ user: { _id: req.user._id, username: req.user.username } }],
        takes: [],
      });
      return;
    }

    crud
      .getAllBooks()
      .populate({ path: "user" })
      .where("_id")
      .in(req.session.books)
      .then((books) => {
        let giveBooks = books.filter(
          (book) =>
            req.session.books.indexOf(book._id.toString()) > -1 &&
            String(book.user._id) == String(req.user._id)
        );

        res.json({
          gives:
            giveBooks.length == 0
              ? [{ user: { _id: req.user._id, username: req.user.username } }]
              : giveBooks.map((book) => {
                  return {
                    _id: book._id,
                    title: book.title,
                    description: book.description,
                    user: {
                      _id: book.user._id,
                      username: book.user.username,
                    },
                  };
                }),
          takes: books
            .filter(
              (book) =>
                req.session.books.indexOf(book._id.toString()) > -1 &&
                String(book.user._id) != String(req.user._id)
            )
            .map((book) => {
              return {
                _id: book._id,
                title: book.title,
                description: book.description,
                user: {
                  _id: book.user._id,
                  username: book.user.username,
                },
              };
            }),
        });
      });
  });

  // Routing for getting success messages
  app.get("/session/success", (req, res) => {
    if (req.session.success) {
      req.session.success = false;
      res.send(req.flash("success")[0]);
    } else {
      res.send("");
    }
  });

  // Routing for getting OAuth error messages
  app.get("/session/auth/error", (req, res) => {
    if (req.session.authError) {
      req.session.authError = false;
      res.send(req.flash("error")[0]);
    } else {
      res.send("");
    }
  });

  // Routing for getting the provider of linked accounts
  app.get("/session/auth/accounts", (req, res) => {
    if (!req.user) {
      res.json([]);
      return;
    }

    crud
      .getUser({ _id: req.user._id })
      .populate({ path: "accounts" })
      .then((user) => {
        res.json(
          user.accounts.map((account) => {
            return {
              _id: account._id,
              provider: account.provider,
            };
          })
        );
      });
  });
};
