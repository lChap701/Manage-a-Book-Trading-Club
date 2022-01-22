const mongoose = require("mongoose");
const { Schema } = mongoose;

// Note: Password is only required when OAuth is not used to create an account!!
const userSchema = new Schema(
  {
    username: { type: String, trim: true, required: "{PATH} is required" },
    password: {
      type: String,
      trim: true,
      validate: {
        validator: () => !this.oauth,
        message: "{PATH} is required",
      },
    },
    email: { type: String, trim: true },
    emailNotifications: { type: Boolean },
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, uppercase: true },
    country: { type: String, trim: true, uppercase: true },
    zipPostal: { type: String, trim: true },
    preciseLocation: { type: Boolean, default: true },
    oauth: { type: Boolean, default: false },
    accounts: [{ type: Schema.Types.ObjectId, ref: "Auths" }],
    books: [{ type: Schema.Types.ObjectId, ref: "Books" }],
  },
  {
    timestamps: {
      updatedAt: false,
    },
  }
);

/**
 * Model for the 'users' collection
 * @module ./models/Users
 *
 */
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
