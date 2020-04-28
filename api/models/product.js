const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

// Creating product schema
const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        index: true,
        required: true
    },
    title: {
        type: String,
        required: true,
        dropDups: true
    },
    type: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    colours: {
        type: [ String ],
        required: true,
        minlength: 1
    },
    sizes: {
        type: [ String ],
        required: true,
        minlength: 1
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    productImages : {
        type: [ String ],
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", productSchema);