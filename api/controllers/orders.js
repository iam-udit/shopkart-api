// Importing all necessary packages
const mongoose = require("mongoose");
const createError = require("http-errors");
const Order = require("../models/order.js");

// Retrieving order's details form database
exports.getOrderById =  (req, res, next) => {

    // Getting order's id from request
    const id = req.params.orderId;

    // Finding order's details using order id.
    Order.findById(id)
        .select("_id product quantity createdAt ")
        .populate("product")
        .exec()
        .then(order => {
            // if order found, return success response
            if (order) {
                res.status(200).json({
                    order: order,
                    request: {
                        type: "GET ",
                        description: "GET_ALL_ORDERS",
                        url: req.protocol + '://' + req.get('host') + "/orders"
                    }
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

// Retrieving order's details according to productId
exports.getOrdersByProductId = (req, res, next) => {

    // Getting product's id from request
    const productId = req.params.productId;

    // Finding products
    Order.find()
        .select("_id user product quantity createdAt")
        .populate("product")
        .where({ product : productId})
        .exec()
        .then(orders => {
            // If order found, return product details
            if (orders.length > 0   ) {
                const response = {
                    count: orders.length,
                    product: orders[0].product,
                    orders: orders.map(order => {
                        return {
                            _id: order._id,
                            user: order.user,
                            quantity: order.quantity,
                            createdAt: order.createdAt,
                            request: {
                                type: "GET",
                                description: "GET_ORDER_DETAILS",
                                url: req.protocol + '://' + req.get('host') + "/orders/" + order._id
                            }
                        }

                    })
                }
                res.status(200).json(response);
            }
            // If order doesn't found, return empty response
            else {
                next(createError(404, "No orders found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Retrieving order's details according to userId
exports.getOrdersByUserId = (req, res, next) => {

    // Getting user's id from request
    const userId = req.userData.id;

    // Finding products
    Order.find()
        .select("_id product quantity createdAt")
        .populate("product")
        .where({ user : userId})
        .exec()
        .then(orders => {
            // If order found, return product details
            if (orders.length > 0   ) {
                const response = {
                    count: orders.length,
                    orders: orders.map(order => {
                        return {
                            _id: order._id,
                            product: order.product,
                            quantity: order.quantity,
                            createdAt: order.createdAt,
                            request: {
                                type: "GET",
                                description: "GET_ORDER_DETAILS",
                                url: req.protocol + '://' + req.get('host') + "/orders/" + order._id
                            }
                        }

                    })
                }
                res.status(200).json(response);
            }
            // If order doesn't found, return empty response
            else {
                next(createError(404, "No orders found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Retrieving all order's details form database
exports.getAllOrders =  (req, res, next) => {

    // Finding all orders
    Order.find()
        .select("_id user product quantity createdAt")
        .populate("product")
        .exec()
        .then(orders => {
            // If order found, return product details
            if (orders.length > 0) {
                const response = {
                    count: orders.length,
                    orders: orders.map(order => {
                        return {
                            _id: order._id,
                            user: order.user,
                            product: order.product,
                            quantity: order.quantity,
                            createdAt: order.createdAt,
                            request: {
                                type: "GET",
                                description: "GET_ORDER_DETAILS",
                                url: req.protocol + '://' + req.get('host') + "/orders/" + order._id
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
        quantity: req.body.quantity
    });

    // Creating a new order
    order.save()
        .then(result => {
            // If  order's created successfully, return success response
            res.status(201).json({
                message: "Order placed successfully",
                createdOrder: {
                    _id: result._id,
                    user: result.user,
                    product: result.product,
                    quantity: result.quantity,
                    createdAt: result.createdAt,
                    request: {
                        type: "GET",
                        description: "GET_ORDER_DETAILS",
                        url: req.protocol + '://' + req.get('host') + "/orders/" + result._id
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

    // Deleting order from database
    Order.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  order's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Order deleted.",
                    request: {
                        type: "POST",
                        description: "CREATE_NEW_ORDER",
                        url: req.protocol + '://' + req.get('host') + "/orders",
                        body: { "product": "String", "quantity": "Number" }
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
            error.message = "order deletion failed !";
            next(error);
        })
};