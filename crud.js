const Users = require("./models/Users");
const Books = require("./models/Books");
const Requests = require("./models/Requests");

/**
 * Module for running CRUD operations on the DB
 * @module ./crud
 *
 */
const crud = {
  addUser: (data) => new Users(data).save(),
  addBook: (data) => new Books(data).save(),
  addRequest: (data) => new Requests(data).save(),
  getUsers: () => Users.find(),
  getAllBooks: () => Books.find(),
  getBooks: (user) => Books.find({ user: user }),
  getRequests: () => Requests.find(),
  getUser: (data) => Users.findOne(data),
  getBook: (id) => Books.findOne({ _id: id }),
  getRequest: (id) => Requests.findOne({ _id: id }),
  updateUser: (id, data) => Users.updateOne({ _id: id }, data),
  updateRequest: (id) =>
    Requests.updateOne({ _id: id }, { traded: true, tradedAt: new Date() }),
  deleteUser: (id) => Users.deleteOne({ _id: id }),
  deleteBook: (id) => Books.deleteOne({ _id: id }),
  deleteRequest: (id) => Requests.deleteOne({ _id: id }),
};

module.exports = crud;
