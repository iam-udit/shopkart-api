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
    emailVerified: { type: Boolean, default: false },
    gender: { type: String },
    age: { type: Number, maxlength: 2 },
    address: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: Number },
        body: { type: String }
    },
    userImage: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);

