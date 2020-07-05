const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

const orderSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        index: true,
        required: true
    },
    logistic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Logistic',
        index: true,
        default: null
    },
    courier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courier',
        index: true,
        default: null
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        index: true,
        required: true
    },
    colour: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    orderStatus: {
        type: String,
        enum: [
            'Pending',
            'Confirmed',
            'Dispatched',
            'Delivered',
            'Canceled',
            'Returned'
        ],
        default: 'Pending'
    },
    shipmentCharges: {
        type: Number,
        required: true,
    },
    totalBalance: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        name: { type: String, required: true },
        mobileNumber: { type: Number, required: true },
        body: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zip: { type: Number, required: true },
    }
}, { timestamps: true });

// Adding plugin to the schema
orderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Order', orderSchema );