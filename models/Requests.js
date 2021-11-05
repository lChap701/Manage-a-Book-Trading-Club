const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  giveBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
      required: "request must include at least one book to give",
    },
  ],
  takeBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
      required: "request must include at least one book to take",
    },
  ],
  users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  traded: { type: Boolean, default: false },
});

/**
 * Model for the 'requests' collection
 * @module ./models/Requests
 *
 */
const Requests = mongoose.model("Requests", requestSchema);

module.exports = Requests;
