const Users = require("./models/Users");
const Books = require("./models/Books");
const Requests = require("./models/Requests");

/**
 * Module for running CRUD operations on the DB
 * @module ./crud
 *
 */
const crud = {
  addUser: (data) => new Users.save(data),
  addBook: (data) => new Books.save(data),
  addRequest: (data) => new Requests.save(data),
  getUsers: () => Users.find(),
  getAllBooks: () => Books.find(),
  getBooks: (user) => Books.find({ user: user }),
  getRequests: () => Requests.find(),
  getUser: (id) => Users.findOne({ _id: id }),
  getBook: (id) => Books.findOne({ _id: id }),
  getRequest: (id) => Requests.findOne({ _id: id }),
  updateUser: (id, data) => Users.updateOne({ _id: id }, data),
  updateRequest: (id) => Requests.updateOne({ _id: id }, { traded: true }),
  deleteBook: (id) => Books.deleteOne({ _id: id }),
  deleteRequest: (id) => Requests.deleteOne({ _id: id }),
};

module.exports = crud;
