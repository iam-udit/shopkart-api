// Importing all necessary packages
const mongoose = require("mongoose");
const createError = require("http-errors");
const Product = require("../models/product.js");

// Retrieving product's details form database
exports.getProductById =  (req, res, next) => {

    // Getting product'd id from request
    const id = req.params.productId;

    // Finding product's details using product id.
    Product.findById(id, { __v: 0 })
        .exec()
        .then(product => {
            // if product found, return success response
            if (product) {
                product.request = {
                    type: "GET ",
                        description: "GET_ALL_PRODUCTS",
                        url: req.protocol + '://' + req.get('host') + "/products/get-all"
                }
                res.status(200).json({
                    status: 200,
                    message: "Product details of the given Id: " + id,
                    product: product
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

// Retrieving all product's details or according to productType form database
exports.getAllProducts =  (req, res, next) => {

    var query = {};

   if ( req.originalUrl.split('/')[2] == 'by-type' ){
       // Query for all product according to productType
        query = { type: req.params.productType };
    } else if ( req.originalUrl.split('/')[2] == 'by-seller' ){
       // Query for all products according to sellerId
        query = { seller: req.params.sellerId };
    } else {
       // Query for all products
       query = {};
   }

    // Finding all products
    Product.paginate(query, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If Product found, return product details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of product details",
                    total: result.total,
                    offSet: result.offset,
                    pages: Math.ceil(result.total / result.limit),
                    products: result.docs.map(product => {
                        return {
                            _id: product._id,
                            title: product.title,
                            type: product.type,
                            colours: product.colours,
                            sizes: product.sizes,
                            price: product.price,
                            productImages : product.productImages,
                            description: product.description,
                            createdAt: product.createdAt,
                            updatedAt: product.updatedAt,
                            request: {
                                type: "GET",
                                description: "GET_PRODUCT_DETAILS",
                                url: req.protocol + '://' + req.get('host') + "/products/get/" + product._id
                            }
                        }

                    })
                }
                res.status(200).json(response);
            }
            // If product doesn't found, return empty response
            else {
                next(createError(404, "Product not found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new product
exports.createProduct = (req, res, next) => {

    // Retrieve images path from req.files
    var productImages = [];
    req.files.forEach(image => {
        productImages.push(image.path);
    });
    // Create new product's document/object
    // and binding the product's details
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        type: req.body.type,
        colours: req.body.colours,
        sizes: req.body.sizes,
        price: req.body.price,
        seller: req.userData.id,
        productImages: productImages,
        description: req.body.description
    });

    // Creating product in database
    product.save()
        .then(result => {
            // If  product's created successfully, return success response
            res.status(201).json({
                status: 201,
                message: "Product created successfully.",
                createdProduct: {
                    _id: result._id,
                    title: result.title,
                    type: result.type,
                    colours: result.colours,
                    sizes: result.sizes,
                    price: result.price,
                    seller: result.seller,
                    productImages: result.productImages,
                    description: result.description,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    request: {
                        type: "GET",
                        description: "GET_PRODUCT_DETAILS",
                        url: req.protocol + '://' + req.get('host') + "/products/get/" + result._id
                    }
                }
            });
        })
        // If any error occurs, return error response
        .catch(error => {
            if (error._message) {
                // If validation faied
                error.message = error.message;
            }  else {
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

    // Retrieve images path from req.files
    var productImages = [];
    req.files.forEach(image => {
        productImages.push(image.path);
    });

    // Create product's document to be update
    const product = {
        title: req.body.title,
        type: req.body.type,
        colours: req.body.colours,
        sizes: req.body.sizes,
        price: req.body.price,
        productImages: productImages,
        description: req.body.description
    };

    // Update product details in database
    Product.updateOne({ _id: id }, { $set: product })
        .exec()
        .then(result => {

            // If product's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Product details updated",
                    request: {
                        type: "GET",
                        description: "GET_PRODUCT_DETAILS",
                        url: req.protocol + '://' + req.get('host') + "/products/" + id
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
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else {
                // If product update failed
                error.message = "Product updation failed !";
            }
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
                    status: 200,
                    message: "Product deleted successfully",
                    request: {
                        type: "POST",
                        description: "CREATE_NEW_PRODUCT",
                        url: req.protocol + '://' + req.get('host') + "/products/create"
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