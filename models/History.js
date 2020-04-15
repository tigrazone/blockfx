const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  type: {
    type: String,
    require: true
  },

  ev_id: {
    type: String,
    require: true
  },

  status: {
    type: String,
    require: true
  },

  message: {
    type: String,
    require: true
  },

  uid: {
    type: String,
    require: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = History = mongoose.model("history", HistorySchema);
