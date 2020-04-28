// Importing all necessary packages
const mongoose = require("mongoose");
const createError = require("http-errors");
const Order = require("../models/order.js");
const productController = require('../controllers/products');

// Retrieving order's details form database
exports.getOrderById =  (req, res, next) => {

    // Getting order's id from request
    const id = req.params.orderId;

    // Finding order's details using order id.
    Order.findById(id, { __v: 0 })
        .populate("product")
        .exec()
        .then(order => {
            // if order found, return success response
            if (order) {
                order.request = {
                    type: "GET",
                    description: "GET_ALL_ORDERS",
                    url: req.protocol + '://' + req.get('host') + "/orders/get-all"
                }
                res.status(200).json({
                    status: 200,
                    message: "Order details of the given Id: " + id,
                    order: order
                });
            }
            // If order doesn't found, return not found response
            else {
                next(createError(404, "No order found for provided ID"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all order's details form database
exports.getAllOrders =  (req, res, next) => {

    var query = {};

    if (req.originalUrl.split('/')[2] == 'by-product'){
        // Query for all orders according to productId
        query = { product: req.params.productId };
    } else if (req.originalUrl.split('/')[2] == 'by-user'){
        // Query for all orders according to userId
        query = { user: req.params.userId };
    } else {
        // Query for all orders
        query = {};
    }

    let option = {
        offset: parseInt(req.params.offSet) || 0,
        populate: 'product',
        limit: 10
    };

    // Finding all orders
    Order.paginate(query, option)
        .then(result => {
            // If order found, return product details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of order details",
                    total: result.total,
                    offset: result.offset,
                    pages: Math.ceil(result.total / result.limit),
                    orders: result.docs.map(order => {
                        return {
                            _id: order._id,
                            user: order.user,
                            product: order.product,
                            colour: order.colour,
                            size: order.size,
                            quantity: order.quantity,
                            totalBalance: order.totalBalance,
                            deliveryAddress: order.deliveryAddress,
                            createdAt: order.createdAt,
                            updatedAt: order.updatedAt,
                            request: {
                                type: "GET",
                                description: "GET_ORDER_DETAILS",
                                url: req.protocol + '://' + req.get('host') + "/orders/get/" + order._id
                            }
                        }

                    })
                }
                res.status(200).json(response);
            }
            // If order doesn't found, return empty response
            else {
                next(createError(404, "No order found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new order
exports.createOrder = (req, res, next) => {

    // Create new order's document/object
    // and binding the order's details
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        user: req.userData.id,
        product: req.body.product,
        colour: req.body.colour,
        size: req.body.size,
        quantity: req.body.quantity,
        totalBalance: req.body.totalBalance,
        deliveryAddress: req.body.deliveryAddress,
    });

    // Creating a new order
    order.save()
        .then(result => {

            // If  order's created successfully, then update product quantity
            productController.updateProductQuantity(result.product, - result.quantity);
            // return success response
            res.status(201).json({
                status: 201,
                message: "Order placed successfully",
                createdOrder: {
                    _id: result._id,
                    user: result.user,
                    product: result.product,
                    colour: result.colour,
                    size: result.size,
                    quantity: result.quantity,
                    totalBalance: result.totalBalance,
                    deliveryAddress: result.deliveryAddress,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    request: {
                        type: "GET",
                        description: "GET_ORDER_DETAILS",
                        url: req.protocol + '://' + req.get('host') + "/orders/get/" + result._id
                    }
                }
            });
        })
        // If any error occurs, return error response
        .catch(error => {
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else {
                // If product creation failed
                error.message = "Order creation failed !";
            }
            next(error);
        })

};

// Delete order
exports.deleteOrder =  (req, res, next) => {

    // Getting order's id from request
    const id = req.params.orderId;

    // Before order deletion, update product quantity
    // Getting product Id and order quantity
    Order.findById(id, { product: 1, quantity: 1}, function (err, order) {
        // Adding order quantity with product quantity
        productController.updateProductQuantity(order.product, order.quantity);
    });

    // Deleting order from database
    Order.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  order's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Order deleted successfully",
                    request: {
                        type: "POST",
                        description: "CREATE_NEW_ORDER",
                        url: req.protocol + '://' + req.get('host') + "/orders/create"
                    }
                });
            }
            // If invalid order id
            else {
                next(createError(404, "Invalid Order Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "Order deletion failed !";
            next(error);
        })
};