const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

// Creating seller's schema
const sellerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String },
    lastName: { type: String },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'is invalid'
        ]
    },
    password: { type: String, required: true},
    statusConfirmed : { type: Boolean, default: false },
    mobileNumber:{ type: Number },
    mobileNumberVerified: { type: Boolean, default: false },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    age: { type: Number, maxlength: 2 },
    address: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: Number },
        body: { type: String }
    },
    sellerImage: { type: String },
}, { timestamps: true });

sellerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Seller", sellerSchema);

