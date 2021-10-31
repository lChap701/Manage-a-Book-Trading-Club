const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    title: { type: String, trim: true, required: "{PATH} is required" },
    description: { type: String, trim: true, required: "{PATH} is required" },
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    request: { type: Schema.Types.ObjectId, ref: "Requests" },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "bumped",
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
