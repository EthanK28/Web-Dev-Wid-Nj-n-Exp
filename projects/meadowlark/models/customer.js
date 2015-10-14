var mongoose = require('mongoose');
var Orders = require('/orders.js');

var customerSchema = mongoose.Schema({
    firtName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    salesNotes: [{
        date: Date,
        salespersonId: Number,
        notes: String,
    }],
});

var Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
