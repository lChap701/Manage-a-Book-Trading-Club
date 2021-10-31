const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  books: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

/**
 * Model for the 'users' collection
 * @module ./models/Users
 *
 */
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
