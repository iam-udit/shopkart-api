const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        index: true,
        required: true
    },
    colour: {
        type: String,
        enum: ['black', 'white', 'gray', 'red', 'pink', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown'],
        required: true
    },
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalBalance: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        name: { type: String, required: true },
        mobileNumber: { type: Number, required: true },
        landMark: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zip: { type: Number, required: true },
    }
}, { timestamps: true });

orderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Order', orderSchema );