const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "{PATH} is required",
      unique: true,
    },
    description: { type: String, trim: true, required: "{PATH} is required" },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: "{PATH} is required",
    },
    numOfRequests: { type: Number, default: 0 },
    requests: [{ type: Schema.Types.ObjectId, ref: "Requests" }],
  },
  {
    timestamps: {
      createdAt: "addedAt",
      updatedAt: "bumpedOn",
    },
  }
);

/**
 * Model for the 'books' collection
 * @module ./models/Books
 *
 */
const Books = mongoose.model("Books", bookSchema);

module.exports = Books;
