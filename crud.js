const Users = require("./models/Users");
const Auths = require("./models/Auths");
const Books = require("./models/Books");
const Requests = require("./models/Requests");
const Trades = require("./models/Trades");
const Notifications = require("./models/Notifications");

/**
 * Module for running CRUD operations on the DB
 * @module ./crud
 *
 */
const crud = {
  addUser: (data) => new Users(data).save(),
  addAuth: (data) => new Auths(data).save(),
  addBook: (data) => new Books(data).save(),
  addRequest: (data) => new Requests(data).save(),
  addTrade: (data) => new Trades(data).save(),
  addNotification: (data) => new Notifications(data).save(),
  getUsers: () => Users.find(),
  getAllBooks: () => Books.find(),
  getBooks: (user) => Books.find({ user: user }),
  getRequests: () => Requests.find(),
  getNotifications: (user) => Notifications.find({ user: user }),
  getUser: (data) => Users.findOne(data),
  getAuth: (data) => Auths.findOne(data),
  getBook: (id) => Books.findOne({ _id: id }),
  getRequest: (id) => Requests.findOne({ _id: id }),
  updateUser: (id, data) => Users.updateOne({ _id: id }, data),
  updateBook: (id, data) => Books.updateOne({ _id: id }, data),
  deleteUser: (id) => Users.deleteOne({ _id: id }),
  deleteAuth: (id) => Auths.deleteOne({ _id: id }),
  deleteBook: (id) => Books.deleteOne({ _id: id }),
  deleteRequest: (id) => Requests.deleteOne({ _id: id }),
  deleteAllAuth: (user) => Auths.deleteMany({ user: user }),
  deleteBooks: (user) => Books.deleteMany({ user: user }),
  deleteRequests: (ids) => Requests.deleteMany().where("_id").in(ids),
  deleteTrades: (request) => Trades.deleteMany({ request: request }),
  deleteNotifications: (user) => Notifications.deleteMany({ user: user }),
};

module.exports = crud;
