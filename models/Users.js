const mongoose = require("mongoose");
const { Schema } = mongoose;

// Note: Password is only required when OAuth is not used to create an account!!
const userSchema = new Schema(
  {
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
    preciseLocation: { type: Boolean, default: true },
    oauth: { type: Boolean, default: false },
    accounts: [
      {
        id: {
          type: String,
          required: [() => this.oauth, "{PATH} is required"],
        },
        username: {
          type: String,
          required: [() => this.oauth, "{PATH} is required"],
        },
        name: String,
        url: {
          type: String,
          required: [() => this.oauth, "{PATH} is required"],
        },
        photos: [{ value: String }],
        provider: {
          type: String,
          enum: ["github", "facebook", "twitter", "google", "microsoft"],
          required: [() => this.oauth, "{PATH} is required"],
        },
      },
    ],
    books: [{ type: Schema.Types.ObjectId, ref: "Books" }],
    requests: [{ type: Schema.Types.ObjectId, ref: "Requests" }],
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
