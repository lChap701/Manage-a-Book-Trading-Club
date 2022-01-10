const mongoose = require("mongoose");
const { Schema } = mongoose;

const authSchema = new Schema({
  id: {
    type: Number,
    required: "{PATH} is required",
  },
  provider: {
    type: String,
    enum: ["github", "facebook", "twitter", "google"],
    required: "{PATH} is required",
  },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
});

/**
 * Model for the 'auth' collection
 * @module ./models/Auth
 *
 */
const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
