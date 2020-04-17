const mongoose = require("mongoose");

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
    mobileNumber:{ type: Number },
    mobileNumberVerified: { type: Boolean, default: false },
    gender: { type: String },
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


module.exports = mongoose.model("Logistic", logisticSchema);

