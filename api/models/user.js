const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

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
        match: [
            new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            'is invalid'
        ]
    },
    emailVerified: { type: Boolean, default: false },
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
    userImage: { type: String },
}, { timestamps: true });

userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", userSchema);

