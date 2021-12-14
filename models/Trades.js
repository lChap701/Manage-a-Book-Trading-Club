const mongoose = require("mongoose");
const { Schema } = mongoose;

const tradeSchema = new Schema({
  gaveUser: { type: Schema.Types.ObjectId, ref: "Users" },
  tookUser: { type: Schema.Types.ObjectId, ref: "Users" },
  request: { type: Schema.Types.ObjectId, ref: "Requests" },
});

/**
 * Model for the 'trades' collection
 * @module ./models/Trades
 *
 */
const Trades = mongoose.model("Trades", tradeSchema);

module.exports = Trades;
