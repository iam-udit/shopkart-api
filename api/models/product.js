const mongoose = require("mongoose");

// Creating product schema
const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, unique: true, required: true, dropDups: true },
    type: { type: String, required: true, lowercase: true, index: true },
    price: { type: Number, required: true },
    productImages : {
        type:[ String ],
    },
    description: { type: String, required: true }
}, { timestamp: true });

module.exports = mongoose.model("Product", productSchema);