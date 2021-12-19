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
      req.user ? { _id: req.user._id, username: req.user.username } : null
    );
  });

  // Routing for getting requested books during trades
  app.get("/session/books", (req, res) => {
    if (!req.session.books) {
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
        res.json({
          gives: books
            .filter((book) => req.session.books.indexOf(book._id.toString()) > -1)
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
          takes: req.session.books
            .filter((book) => req.session.books.indexOf(book) == -1)
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

  // Routing for getting success messages for the Book Exchange - All Requests Page
  app.get("/session/success", (req, res) => {
    if (req.session.success) {
      req.session.success = false;
      res.send(req.flash("success")[0]);
    }
  });
};
