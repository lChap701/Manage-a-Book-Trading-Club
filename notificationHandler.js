const crud = require("./crud");

/**
 * Module for adding categories to notifications before they are saved in the DB
 * @module ./notificationHandler
 *
 */
const notificationHandler = {
  addToUsers: (data) => crud.addNotification({ ...data, category: "Users" }),
  addToBooks: (data) => crud.addNotification({ ...data, category: "Books" }),
  addToRequests: (data) =>
    crud.addNotification({ ...data, category: "Requests" }),
  addToTrades: (data) => crud.addNotification({ ...data, category: "Trades" }),
  addToSecurityUpdates: (data) =>
    crud.addNotification({ ...data, category: "Security Updates" }),
};

module.exports = notificationHandler;
