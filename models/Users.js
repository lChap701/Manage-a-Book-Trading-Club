const mongoose = require("mongoose");
const { Schema } = mongoose;

// Note: Password is only required when OAuth is not used to create an account!!
const userSchema = new Schema({
  username: { type: String, trim: true, required: "{PATH} is required" },
  password: {
    type: String,
    trim: true,
    required: [() => !this.oauth, "{PATH} is required"],
  },
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  zipPostal: { type: String, trim: true },
  oauth: { type: Boolean, default: false },
  accounts: [
    {
      id: String,
      username: String,
      name: String,
      url: String,
      photos: [{ value: String }],
      provider: String,
    },
  ],
  books: [{ type: Schema.Types.ObjectId, ref: "Books" }],
  requests: [{ type: Schema.Types.ObjectId, ref: "Requests" }],
});

/**
 * Model for the 'users' collection
 * @module ./models/Users
 *
 */
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
