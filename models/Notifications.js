const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    message: { type: String, required: "{PATH} is required" },
    category: {
      type: String,
      enum: ["Requests", "Trades", "Books", "Users", "Security Updates"],
      required: "{PATH} is required",
    },
    user: { type: Schema.Types.ObjectId, ref: "Users" },
  },
  {
    timestamps: {
      createdAt: "sentOn",
      updatedAt: false,
    },
  }
);

/**
 * Model for the 'notifications' collection
 * @module ./models/Notifications
 *
 */
const Notifications = mongoose.model("Notifications", notificationSchema);

module.exports = Notifications;
