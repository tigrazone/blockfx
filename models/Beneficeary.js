const mongoose = require("mongoose");

const BeneficearySchema = new mongoose.Schema({
  uid: {
    type: String,
    require: true
  },
  
  beneficearyName: {
    type: String,
    require: true
  },
  
  beneficearyAddress: {
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
  },
  
  reference: {
    type: String,
    require: true
  }
});

module.exports = Beneficeary = mongoose.model("beneficeary", BeneficearySchema);
