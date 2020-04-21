const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

// Creating product schema
const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
    price: {
        type: Number,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        index: true,
        required: true
    },
    productImages : {
        type:[ String ],
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", productSchema);