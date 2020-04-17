const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',index: true, required: true },
    quantity: { type: Number, default: 1 },
    createdAt: { type: String, default: new Date().toISOString() }
});

module.exports = mongoose.model('Order', orderSchema );