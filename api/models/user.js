const mongoose = require("mongoose");

// Creating user's schema
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String },
    lastName: { type: String },
    mobileNumber:{
        type: Number,
        required: true,
        unique: true,
    },
    password: { type: String, required: true},
    email: {
        type: String,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    emailVarified: { type: Boolean, default: false },
    address: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: Number },
        body: { type: String }
    },
    imagePath: { type: String },
}, { timestamp: true });

module.exports = mongoose.model("User", userSchema);