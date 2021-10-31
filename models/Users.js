const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, trim: true, required: "{PATH} is required" },
  password: { type: String, trim: true, required: "{PATH} is required" },
  name: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  address: { type: String, trim: true },
  books: [{ type: Schema.Types.ObjectId, ref: "Books" }],
});

/**
 * Model for the 'users' collection
 * @module ./models/Users
 *
 */
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
