// Importing all necessary packages
// const path = require('path'); // Removed as per ESLint no-unused-vars
const mongoose = require('mongoose');
const createError = require('http-errors');
const utils = require('../middlewares/utils');
const Product = require('../models/product.js');
const contract = require('../sdk/gateway/contract');

// Building query for get products
function buildQuery(req) {
    let query = [];

    let path = req.originalUrl.split('/')[2];

    if (path === 'get-all') {
        // Query for all products
        query = [];
    } else if (path === 'get') {
        // Quering product details by Id
        query = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.productId),
                },
            },
        ];
    } else if (path === 'by-type') {
        // Query for all product according to productType
        query = [{ $match: { type: req.params.productType } }];
    } else if (path === 'by-seller') {
        // Query for all products according to sellerId
        query = [
            {
                $match: {
                    seller: new mongoose.Types.ObjectId(req.params.sellerId),
                },
            },
        ];
    } else if (path === 'by-search') {
        // Query for products according to matched text
        query = [
            {
                $match: {
                    $or: [
                        { title: { $regex: req.params.text, $options: 'i' } },
                        { type: { $regex: req.params.text, $options: 'i' } },
                        {
                            description: {
                                $regex: req.params.text,
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
        ];
    } else if (path === 'by-title') {
        // Building query for title route
        query = [
            { $match: { title: req.params.productTitle } },
            { $sort: { price: 1 } },
            {
                $group: {
                    _id: req.params.productTitle,
                    details: { $first: '$$ROOT' },
                    sellerList: {
                        $push: {
                            seller: '$seller',
                            product: '$_id',
                            price: '$price',
                            name: '$Seller.name',
                        },
                    },
                },
            },
        ];
    }

    return query;
}

// Retrieving and adding productImages to request
function addProductImages(req) {
    if (req.files !== 'undefined') {
        // Retrieve images path from req.files
        let productImages = [];

        req.files.forEach((image) => {
            productImages.push(image.path.replace('public/uploads/', ''));
        });

        // Adding productImages to request body
        req.body.productImages = productImages;
    }
}

// Retrieving product's details according to productId and productTitle
exports.getProduct = async function (req, res, next) {
    // Building query
    let query = buildQuery(req);

    // Making request path
    let path = req.originalUrl.split('/')[2];

    try {
        // Finding product's details, and returning response
        const product = await Product.aggregate(query).exec();

        // if product found, return success response
        if (product && product.length > 0) {
            // Making response
            let response = {
                status: 200,
                message: 'Product details of the given input',
                product: product[0], // product is an array from aggregate
                request: {
                    type: 'GET ',
                    description: 'GET_ALL_PRODUCTS',
                    url:
                        req.protocol +
                        '://' +
                        req.get('host') +
                        '/products/get-all',
                },
            };

            // Manage the response
            if (path === 'get') {
                // If request to get by productId
                // Ensure product[0] is not undefined before trying to assign to its property
                if (response.product) {
                    response.product.request = response.request;
                }
                delete response.request;
            } else {
                // If request to get by productTitle
                // Ensure product[0] and product[0].details are not undefined
                if (response.product && response.product.details) {
                    response.sellerList = response.product.sellerList; // Assuming sellerList is part of product[0]
                    response.product = response.product.details;
                } else if (response.product) {
                    // if details is not there but product[0] is
                    response.sellerList = response.product.sellerList;
                    // response.product remains product[0]
                }
            }

            // Returning success response
            res.status(200).json(response);
        } else {
            // If product doesn't found, return not found response
            next(createError(404, 'No valid entry found for provided input'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Retrieving all product's details or according to productType / sellerId from database
exports.getAllProducts = async function (req, res, next) {
    // Building query
    let query = buildQuery(req);

    // Adding grouping by title to query
    query.push(
        { $sort: { price: 1 } },
        { $group: { _id: '$title', details: { $first: '$$ROOT' } } }
    );

    // Aggregating the products
    let aggregate = Product.aggregate(query);

    try {
        // Finding products
        const result = await Product.aggregatePaginate(aggregate, {
            page: req.params.offSet || 1,
            limit: 20,
        });

        // If Product found, return product details
        if (result.totalDocs > 0) {
            const response = {
                status: 200,
                message: 'A list of product details',
                total: result.totalDocs,
                offSet: result.page,
                pages: result.totalPages,
                products: result.docs.map((productDoc) => {
                    return utils.productResponse(req, productDoc.details);
                }),
            };
            res.status(200).json(response);
        }
        // If product doesn't found, return empty response
        else {
            next(createError(404, 'Product not found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Creating new product
exports.createProduct = async function (req, res, next) {
    // Adding productImages to request body
    addProductImages(req);

    // Create new product's document/object and binding the product's details
    const product = new Product(req.body);

    // Adding productId, productImages and sellerId to request
    product._id = new mongoose.Types.ObjectId();
    product.seller = req.userData.id;

    try {
        // Create assets in chain code
        await contract.invoke({
            org: 'ecom',
            user: req.userData.id.toString(),
            method: 'CreateAsset',
            args: [
                product._id.toString(),
                product.type,
                product.title,
                product.seller.toString(),
                product.price.toString(),
                product.quantity.toString(),
            ],
        });

        // Creating product in database
        let result = await product.save();

        // If  product's created successfully, return success response
        await res.status(201).json({
            status: 201,
            message: 'Product created successfully.',
            createdProduct: utils.productResponse(req, result),
        });
    } catch (error) {
        if (error._message) {
            // If validation failed, error.message should already be set by Mongoose.
            // The line `error.message = error.message;` was a no-op and caused `no-self-assign`.
        } else {
            // If not a Mongoose validation error (no _message), set a generic one.
            error.message = 'Product creation failed !';
        }
        next(error);
    }
};

// Update Product details
exports.updateProduct = async function (req, res, next) {
    // Retrieving product id from request
    const id = req.params.productId;

    try {
        // Retrieve update option from request body
        var updateOps = await utils.updateProductOps(req);

        // Adding productImages to request body
        addProductImages(req);

        // Update product details in database
        let result = await Product.updateOne(
            { _id: id, seller: req.userData.id },
            { $set: updateOps } // Use updateOps instead of req.body
        );

        // If product's details updated successfully, return success response
        if (result.nModified > 0 || result.modifiedCount > 0) {
            // Added modifiedCount for newer Mongoose
            await res.status(200).json({
                status: 200,
                message: 'Product details updated',
                request: {
                    type: 'GET',
                    description: 'GET_PRODUCT_DETAILS',
                    url:
                        req.protocol +
                        '://' +
                        req.get('host') +
                        '/products/get/' +
                        id,
                },
            });
        } else {
            // If invalid product id
            next(createError(404, 'Invalid Product Id !'));
        }
    } catch (error) {
        // If product's updation failed.
        if (error._message) {
            // If validation failed, error.message should already be set by Mongoose.
        } else {
            // If not a Mongoose validation error, set a generic one.
            error.message = 'Product updation failed !';
        }
        next(error);
    }
};

// Delete product
exports.deleteProduct = async function (req, res, next) {
    // Getting product's id from request
    const productId = req.params.productId;

    try {
        // Deleting product product database
        // Using deleteOne instead of deprecated remove
        const result = await Product.deleteOne({
            _id: productId,
            seller: req.userData.id,
        }).exec();

        // If  product's deleted successfully, return success response
        // Check deletedCount for Mongoose v6+
        if (result.deletedCount > 0) {
            // Delete assets from couchDb
            await contract.invoke({
                org: 'ecom',
                user: req.userData.id.toString(),
                method: 'DeleteAsset',
                args: [req.userData.id.toString(), productId],
            });

            await res.status(200).json({
                status: 200,
                message: 'Product deleted successfully',
                request: {
                    type: 'POST',
                    description: 'CREATE_NEW_PRODUCT',
                    url:
                        req.protocol +
                        '://' +
                        req.get('host') +
                        '/products/create',
                },
            });
        } else {
            // If invalid product id
            next(createError(404, 'Invalid Product Id !'));
        }
    } catch (error) {
        // If any error occurs, return error response
        error.message = 'Product deletion failed !';
        next(error);
    }
};

// Update product quantity
exports.updateProductQuantity = async function (id, quantity) {
    //Finding product's quantity using product id.
    const product = await Product.findById(id, { quantity: 1 }).exec();

    // If product is exists then update quantity of the product
    if (product) {
        await Product.updateOne(
            { _id: id },
            { $set: { quantity: product.quantity + quantity } }
        ).exec();
        // Optionally log success or handle result of updateOne if needed
        // console.log(`Quantity updated for product ${id}`);
    } else {
        // Optionally log or handle if product not found
        // console.warn(`Product with ID ${id} not found for quantity update.`);
    }
    // Removed useless try-catch, errors will propagate to the caller
};
