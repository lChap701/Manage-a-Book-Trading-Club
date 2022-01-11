const mongoose = require("mongoose");
const { Schema } = mongoose;

const authSchema = new Schema({
  id: {
    type: Number,
    required: "{PATH} is required",
  },
  provider: {
    type: String,
    lowercase: true,
    enum: ["github", "facebook", "twitter", "google"],
    required: "{PATH} is required",
  },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
});

/**
 * Model for the 'auths' collection
 * @module ./models/Auths
 *
 */
const Auths = mongoose.model("Auths", authSchema);

module.exports = Auths;
