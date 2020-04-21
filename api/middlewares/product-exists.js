// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const Product = require('../models/product');

// Validating product exists or not
module.exports = function (req, res, next) {

    var query = {};

    if ( req.method = 'POST' ){
        // Query for searching product for post method
        query = { title : req.body.title, seller: req.userData.id };
    } else {
        // Query for searching product for patch method
        query = {
            title : req.body.title,
            seller: req.userData.id,
            _id: { $ne : req.params.productId }
        };
    }

    Product.find( query, (err, users) => {

        if (err){
            // If any error occur
            return next(createError(500, err.message));
        } else if (users.length > 0) {
            // If product is exists, return error message
            return next(createError(409, "Duplicate product entry !"));
        } else {
            // If product not exist, then allow for create or update
            next();
        }
    })
}