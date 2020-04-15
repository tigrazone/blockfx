const mongoose = require("mongoose");
const db = process.env.MONGO_URI;
const notifier = require('../services/notifier');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      dbName: 'blockfx'
    });

    console.log("MongoDB connected!");
  } catch (err) {
    notifier.pushForce(err);
    console.error(err.message);
    //Exit process with failed
    process.exit(1);
  }
};

module.exports = connectDB;
