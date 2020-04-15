const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    require: true
  },

  lastname: {
    type: String,
    require: true
  },

  login: {
    type: String,
    require: false,
    unique: true
  },

  password: {
    type: String,
    require: false,
  },

  email: {
    type: String,
    require: true
  },

  phone: {
    type: String,
    require: true
  },

  copyPassport: {
    Buffer
    // require: true
  },

  sefliPassport: {
    Buffer
    // require: true
  },

  proofAddress: {
    Buffer
    // require: true
  },

  approve: {
    type: Boolean,
    require: true
  },

  salesForceContactId: {
    type: String,
    require: false
  },

  recovery_code: {
    type: String,
    require: false,
    default: null
  },

  email_change_code: {
    type: String,
    require: false,
    default: null
  },

  new_email: {
    type: String,
    require: false,
    default: null
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("user", UserSchema);
