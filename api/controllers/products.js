// Importing all necessary packages
const mongoose = require("mongoose");
const createError = require("http-errors");
const Product = require("../models/product.js");

// Retrieving product's details form database
exports.getProductById =  (req, res, next) => {

    // Getting product'd id from request
    const id = req.params.productId;

    // Finding product's details using product id.
    Product.findById(id)
        .select("_id title type price imagePath description createdAt updatedAt")
        .exec()
        .then(doc => {
            // if product found, return success response
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET ",
                        description: "GET_ALL_PRODUCTS",
                        url: "http://localhost:8000/products"
                    }
                });
            }
            // If product doesn't found, return not found response
            else {
                next(createError(404, "No valid entry found for provided ID"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving product's details according to productType
exports.getProductsByType = (req, res, next) => {

    // Getting product's id from request
    const type = req.params.productType;

    // Finding products
    Product.find()
        .select("_id title type price imagePath description")
        .where({ type : type})
        .exec()
        .then(docs => {
            // If Product found, return product details
            if (docs) {
                const response = {
                    count: docs.length,
                    products: docs.map(doc => {
                        return {
                            _id: doc._id,
                            title: doc.title,
                            type: doc.type,
                            price: doc.price,
                            imagePath : doc.imagePath,
                            description: doc.description,
                            request: {
                                type: "GET",
                                description: "GET_PRODUCT_DETAILS",
                                url: "http://localhost:8000/products/" + doc._id
                            }
                        }

                    })
                }
                res.status(201).json(response);
            }
            // If product doesn't found, return empty response
            else {
                next(createError(404, "No entries found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Retrieving all product's details form database
exports.getAllProducts =  (req, res, next) => {

    // Finding all products
    Product.find()
        .select("_id title type price imagePath description")
        .exec()
        .then(docs => {
            // If Product found, return product details
            if (docs) {
                const response = {
                    count: docs.length,
                    products: docs.map(doc => {
                        return {
                            _id: doc._id,
                            title: doc.title,
                            type: doc.type,
                            price: doc.price,
                            imagePath : doc.imagePath,
                            description: doc.description,
                            request: {
                                type: "GET",
                                description: "GET_PRODUCT_DETAILS",
                                url: "http://localhost:8000/products/" + doc._id
                            }
                        }

                    })
                }
                res.status(200).json(response);
            }
            // If product doesn't found, return empty response
            else {
                next(createError(404, "No entries found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new product
exports.createProduct = (req, res, next) => {

    // Create new product's document/object
    // and binding the product's details
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        type: req.body.type,
        price: req.body.price,
        imagePath: req.body.imagePath,
        description: req.body.description
    });

    // Creating product in database
    product.save()
        .then(result => {
            // If  product's created successfully, return success response
            res.status(200).json({
                message: "Product created successfully.",
                createdProduct: {
                    _id: result._id,
                    title: result.title,
                    type: result.type,
                    price: result.price,
                    imagePath: result.imagePath,
                    description: result.description,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    request: {
                        type: "GET",
                        description: "GET_PRODUCT_DETAILS",
                        url: "http://localhost:8000/products/" + result._id
                    }
                }
            });
        })
        // If any error occurs, return error response
        .catch(error => {
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else if(error.errmsg){
                // If product already exists.
                error = createError(409,"Duplicate product entry.");
            } else {
                // If product creation failed
                error.message = "Product creation failed !";
            }
            next(error);
        })

};

// Update Product details
exports.updateProduct = (req, res, next) => {

    // Retrieving product id from request
    const id = req.params.productId;

    // Retrieve update option from request body
    const updateOps = {};

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.propValue;
    }

    // Update product details in database
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If product's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    message: "Product updated.",
                    request: {
                        type: "GET",
                        description: "GET_PRODUCT_DETAILS",
                        url: "http://localhost:8000/products/" + id
                    }
                });
            }
            // If invalid product id
            else {
                next(createError(404, "Invalid Product Id !"));
            }

        })
        // If product's updation failed.
        .catch(error => {
            error.message = "Product updation failed !";
            next(error);
        });

};

// Delete product
exports.deleteProduct =  (req, res, next) => {

    // Getting product's id from request
    const id = req.params.productId;

    // Deleting product product database
    Product.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  product's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Product deleted.",
                    request: {
                        type: "POST",
                        description: "CREATE_NEW_PRODUCT",
                        url: "http://localhost:8000/products",
                        body: { "name": "String", "price": "Number" }
                    }
                });
            }
            // If invalid product id
            else {
                next(createError(404, "Invalid Product Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "Product deletion failed !";
            next(error);
        })
};