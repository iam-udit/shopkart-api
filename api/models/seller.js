const mongoose = require("mongoose");
const utils = require('../middlewares/utils');
const mongoosePaginate = require('mongoose-paginate');

// Getting and manging common schema options
const schemaOps = utils.schemaOps();
schemaOps.sellerImage = { type: String };

// Creating seller's schema
const sellerSchema = new mongoose.Schema(schemaOps, { timestamps: true });

// Adding plugin to the schema
sellerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Seller", sellerSchema);

