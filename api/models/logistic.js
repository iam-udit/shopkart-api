const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

// Creating logistic's schema
const logisticSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
    logisticImage: { type: String },
}, { timestamps: true });

logisticSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Logistic", logisticSchema);

