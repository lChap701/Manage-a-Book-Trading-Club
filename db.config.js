require("dotenv").config();
const mongoose = require("mongoose");

/**
 * Attempts to connect to the DB and displays the result in the console
 * @module ./db.config
 *
 */
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connection Established!");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

module.exports = connectDB;
