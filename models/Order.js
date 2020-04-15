const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  buyCurrency: {
    type: String,
    require: true
  },
  
  saleCurrency: {
    type: String,
    require: true
  },
  
  buyAmount: {
    type: String,
    require: true
  },
  
  exchangeRate: {
    type: String,
    require: true
  },
  
  payment_acc_id: {
    type: String,
    require: true
  },
  
  beneficeary_id: {
    type: String,
    require: true
  },
	
  uid: {
    type: String,
    require: true
  },

  status: {
    type: String,
    require: true,
    default: "pending"
  },
	
  salesForceOrderId: {
    type: String,
    require: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Order = mongoose.model("order", OrderSchema);
