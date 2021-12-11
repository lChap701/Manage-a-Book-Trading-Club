const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  giveUser: { type: Schema.Types.ObjectId, ref: "Users" },
  giveBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
    },
  ],
  takeUser: { type: Schema.Types.ObjectId, ref: "Users" },
  takeBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
    },
  ],
  traded: { type: Boolean, default: false },
  requestedAt: Date,
  tradedAt: Date,
});

/**
 * Model for the 'requests' collection
 * @module ./models/Requests
 *
 */
const Requests = mongoose.model("Requests", requestSchema);

module.exports = Requests;
