const mongoose = require("mongoose");
const utils = require('../middlewares/utils');
const mongoosePaginate = require('mongoose-paginate');

// Getting common schema options
const schemaOps = utils.schemaOps();

// Creating user's schema
const userSchema = new mongoose.Schema({
    _id: schemaOps._id,
    firstName: { type: String },
    lastName: { type: String },
    mobileNumber:{
        type: Number,
        required: true,
        unique: true,
    },
    password: schemaOps.password,
    email: {
        type: String,
        lowercase: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'is invalid'
        ]
    },
    emailVerified: { type: Boolean, default: false },
    gender: schemaOps.gender,
    age: schemaOps.age,
    address: schemaOps.address,
    userImage: { type: String },
}, { timestamps: true });

// Adding plugin to the schema
userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", userSchema);

