// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const Product = require('../models/product');


// Validating product exists or not
module.exports = async function (req, res, next) {

    var query = {};

    try {
            if ( req.method == 'POST' ){
                // Query for searching product for post method
                query = {
                    title : req.body.title,
                    type: req.body.type,
                    seller: req.userData.id
                };
            } else {
                // Query for searching product for put method
                query = {
                    title : req.body.title,
                    seller: req.userData.id,
                    _id: { $ne : req.params.productId }
                };
            }

            // Checking if the product is exist or not
            let productExist = await Product.findOne(query);

            if (productExist) {
                if (req.method == 'POST') {
                    // If product is exists, return error message - can't create
                    return next(createError(409, "Duplicate product entry !"));
                } else {
                    // If product is not exists, return error message - cant't update
                    return next(createError(404, 'Product not exists !'))
                }
            } else {

                // If product not exist, then allow for create
                // Incase of update if exist then allow
                return next();
            }

    } catch (error) {
        // If any error occur
        next(createError(500, error.message));
    }
}