const mongoose = require("mongoose");
const utils = require('../middlewares/utils');
const mongoosePaginate = require('mongoose-paginate');

// Getting and manging common schema options
const schemaOps = utils.schemaOps();
schemaOps.logisticImage = { type: String };

// Creating logistic's schema
const logisticSchema = new mongoose.Schema(schemaOps, { timestamps: true });

// Adding plugin to the schema
logisticSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Logistic", logisticSchema);

