const mongoose = require("mongoose");
const utils = require('../middlewares/utils');
const mongoosePaginate = require('mongoose-paginate');

// Getting and manging common schema options
const schemaOps = utils.schemaOps();

// Creating courier's schema
const courierSchema = new mongoose.Schema({
    _id: schemaOps._id,
    logistic: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Logistic' },
    firstName: schemaOps.firstName,
    lastName: schemaOps.lastName,
    email: schemaOps.email,
    password: schemaOps.password,
    mobileNumber: schemaOps.mobileNumber,
    gender: schemaOps.gender,
    age: schemaOps.age,
    address: schemaOps.address,
    courierImage: { type: String },
}, { timestamps: true });

// Adding plugin to the schema
courierSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Courier", courierSchema);

