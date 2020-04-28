const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

// Creating courier's schema
const courierSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    logistic: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Logistic' },
    firstName: { type: String },
    lastName: { type: String },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: { type: String, required: true},
    mobileNumber:{ type: Number },
    gender: { type: String },
    age: { type: Number, maxlength: 2 },
    address: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: Number },
        body: { type: String }
    },
    courierImage: { type: String },
}, { timestamps: true });

courierSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Courier", courierSchema);

