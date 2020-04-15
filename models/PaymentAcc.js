const mongoose = require("mongoose");

const PaymentAccSchema = new mongoose.Schema({
  uid: {
    type: String,
    require: true
  },
  
  bankName: {
    type: String,
    require: true
  },
  
  bankAddress: {
    type: String,
    require: true
  },
  
  IBAN: {
    type: String,
    require: true
  },
  
  bankSwiftBICcode: {
    type: String,
    require: true
  },
  
  bankCountry: {
    type: String,
    require: true
  },
  
  currency: {
    type: String,
    require: true
  }
});

module.exports = PaymentAcc = mongoose.model("paymentAcc", PaymentAccSchema);
