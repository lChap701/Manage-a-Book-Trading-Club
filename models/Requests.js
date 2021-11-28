const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  giveBooks: [
    {
      book: {
        type: Schema.Types.ObjectId,
        ref: "Books",
        required: "request must include at least one book to give",
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: "request must include at least one user",
      },
    },
  ],
  takeBooks: [
    {
      book: {
        type: Schema.Types.ObjectId,
        ref: "Books",
        required: "request must include at least one book to take",
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: "request must include at least one user",
      },
    },
  ],
  traded: { type: Boolean, default: false },
});

/**
 * Model for the 'requests' collection
 * @module ./models/Requests
 *
 */
const Requests = mongoose.model("Requests", requestSchema);

module.exports = Requests;
