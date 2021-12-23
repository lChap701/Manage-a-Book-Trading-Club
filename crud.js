const Users = require("./models/Users");
const Books = require("./models/Books");
const Requests = require("./models/Requests");
const Trades = require("./models/Trades");

/**
 * Module for running CRUD operations on the DB
 * @module ./crud
 *
 */
const crud = {
  addUser: (data) => new Users(data).save(),
  addBook: (data) => new Books(data).save(),
  addRequest: (data) => new Requests(data).save(),
  addTrade: (data) => new Trades(data).save(),
  getUsers: () => Users.find(),
  getAllBooks: () => Books.find(),
  getBooks: (user) => Books.find({ user: user }),
  getRequests: () => Requests.find(),
  getUser: (data) => Users.findOne(data),
  getBook: (id) => Books.findOne({ _id: id }),
  getRequest: (id) => Requests.findOne({ _id: id }),
  updateUser: (id, data) => Users.updateOne({ _id: id }, data),
  updateBook: (id, data) => Books.updateOne({ _id: id }, data),
  deleteUser: (id) => Users.deleteOne({ _id: id }),
  deleteBook: (id) => Books.deleteOne({ _id: id }),
  deleteRequest: (id) => Requests.deleteOne({ _id: id }),
  deleteRequests: (ids) => Requests.deleteMany({}).where("_id").in(ids),
  deleteTrades: (request) => Trades.deleteMany({ request: request }),
};

module.exports = crud;
