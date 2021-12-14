const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  giveBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
    },
  ],
  takeBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Books",
    },
  ],
  traded: { type: Boolean, default: false },
  trade: { type: Schema.Types.ObjectId, ref: "Trades" },
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
