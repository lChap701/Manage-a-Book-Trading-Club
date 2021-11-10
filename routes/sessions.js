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
    res.json(req.user ? req.user : null);
  });

  // Routing for getting requested books during trades
  app.get("/session/books", (req, res) => {
    res.json(req.session.books ? req.session.books : null);
  });
};
