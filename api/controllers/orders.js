// Importing all necessary packages
const mongoose = require("mongoose");
const createError = require("http-errors");
const utils = require('../middlewares/utils');
const contract = require('../sdk/gateway/contract');
const productController = require('../controllers/products');

const Order = require("../models/order.js");

// Building query
function buildQuery(req) {

    let query = {};

    // Getting path
    let path = req.originalUrl.split('/')[2];

    // Building query
    switch (path) {
        case 'by-user':
            // Query for all orders according to userId
            query = { user: req.userData.id };
            break;
        case 'by-seller':
            // Query for all orders according to sellerId
            query = {
                seller: req.userData.id,
                orderStatus: req.params.status || 'Pending'
            };
            break;
        case 'by-logistic':
            // Query for all orders according to logisticId
            query = {
                logistic: req.userData.id,
                orderStatus: req.params.status
            };
            break;
        case 'by-logistic':
            // Query for all orders according to courierId
            query = {
                courier: req.userData.id,
                orderStatus: req.params.status
            };
            break;
        case 'by-product':
            // Query for all orders according to productId
            query = { product: req.params.productId };
            break;
        default:
            // Query for all orders
            query = {};
    }

    return query;
}

// Retrieving order's details form database
exports.getOrderById = function (req, res, next) {

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
exports.getAllOrders =  function (req, res, next) {

    // Building query
    var query = buildQuery(req);

    let option = {
        offset: ( parseInt(req.params.offSet) - 1 || 0 ) * 10,
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
                    offset: (result.offset / 10) + 1,
                    pages: Math.ceil(result.total / result.limit),
                    orders: result.docs.map(order => {
                        return utils.orderResponse(req, order);
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
exports.createOrder = function (req, res, next) {

    // Create new order's document and binding the order's details
    const order = new Order(req.body);

    // Adding orderId and userId to order
    order._id =  new mongoose.Types.ObjectId();
    order.user = req.userData.id;

    // Creating a new order
    order.save()
        .then(result => {

            // If  order's created successfully, then update product quantity
            productController.updateProductQuantity(result.product, - result.quantity);

            // return success response
            res.status(201).json({
                status: 201,
                message: "Order placed successfully",
                createdOrder: utils.orderResponse(req, result)
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

// Accept order by seller
exports.acceptOrderBySeller = function (req, res, next) {

    let options = {
        org: "ecom",
        user: req.userData.id.toString(),
        method: "AcceptOrderBySeller",
        args: [
            req.params.orderId,
            req.userData.id.toString(),
            req.body.user,
            req.body.productName,
            req.body.totalBalance.toString(),
            req.body.shipmentCharges.toString(),
            req.body.quantity.toString()
        ]
    };

    // Confirmed pending order of the product
    contract.invoke(options)
        .then( data =>{
            // Saving logistic ID and Updating order status
            return Order.updateOne(
                { _id: req.params.orderId },
                { $set: { logistic: req.body.logistic, orderStatus: 'Confirmed' }}
            )
        })
        .then(result=>{
            // If order's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Order Confirmed !"
                })
            } else {
                next(createError(404,'Invalid order ID !'));
            }
        })
        .catch(e=>{
            next(createError(500,'Order Confirmation failed !'))
        })
}

// Accept order by logistic
exports.acceptOrderByLogistic = function (req, res, next) {

    let options = {
        org: "delivery",
        user: 'admin',
        method: "AcceptOrderByDelivery",
        args: [
            req.params.orderId,
            req.userData.id.toString(),
            req.body.courier
        ]
    };
    // Dispatched the confirmed order by logistic
    contract.invoke(options )
        .then( data =>{
            // Saving courier ID and Updating order status to Dispatched
            return Order.updateOne(
                { _id: req.params.orderId },
                { $set: { courier: req.body.courier, orderStatus: 'Dispatched' }}
            )
        })
        .then(result=>{
            // If order's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Order Dispatched !"
                })
            } else {
                next(createError(404,'Invalid Oder ID !'));
            }
        })
        .catch(error=>{
            // If any error occur, return error response
            if(error.status == 403){
                next(createError(403, "Insufficient balance !"))
            } else {
                next(createError(500, 'Order failed to dispatch !"'));
            }
        })
}

// Confirm delivery of the order by courier
exports.confirmDeliveryByCourier = function (req, res, next) {

    let options = {
        org: "delivery",
        user: req.userData.id.toString(),
        method: "ConfirmDeliveryByCourier",
        args: [
            req.params.orderId,
            req.userData.id.toString(),
            req.body.user
        ]
    };
    // Delivered the dispatched order by logistic
    contract.invoke(options )
        .then( data =>{
            // Updating order status to Delivered
            return Order.updateOne(
                { _id: req.params.orderId },
                { $set: { orderStatus: 'Delivered' }}
            )
        })
        .then(result=>{
            // If order's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Order Delivered Successfully !"
                })
            } else {
                next(createError(404,'Invalid Oder ID !'));
            }
        })
        .catch(error=>{
            // If any error occur, return error response
            if(error.status == 403){
                // Access denied: unknown customer
                // Access denied: unknown courier
                next(error);
            } else {
                next(createError(500, 'Order delivery failed !'));
            }
        })
}

// Cancel order
exports.cancelOrder =  async function (req, res, next) {

    // Getting order's id from request
    const id = req.params.orderId;

    try {
        //  Delete order from couchDb
        await contract.invoke( {
            org: "ecom",
            user: 'admin',
            method: "DeleteOrder",
            args: [id.toString()]
        });

        // Canncel order from database
        let result = await Order.update({ "_id": id }, { $set: { orderStatus: 'Canceled' } });

        // If  order's deleted successfully, return success response
        if (result.nModified > 0) {

            // After order Cancelation, update product quantity
            // Getting product Id and order quantity
            Order.findById(id, { product: 1, quantity: 1}, function (err, order) {
                // Adding order quantity with product quantity
                productController.updateProductQuantity(order.product, order.quantity);
            });

            await res.status(200).json({
                status: 200,
                message: "Order canceled successfully",
                request: {
                    type: "POST",
                    description: "CREATE_NEW_ORDER",
                    url: req.protocol + '://' + req.get('host') + "/orders/create"
                }
            });

        } else {
            // If invalid order id
            next(createError(404, "Invalid Order Id !"));
        }


    } catch (error) {
        // If any error occurs, return error response
        error.message = "Order cancellation failed !";
        next(error);
    }
};


// Checking user's permission
exports.checkUsersPermission = function (req, res, next) {

    let role = req.userData.role;
    let path = req.originalUrl.split('/')[2];

    if (
        // Checking admin access
        ( ( path == 'get-all' || path == 'by-product' ) && role != 'admin' ) ||
        // Checking customer access
        ( ( path == 'create' || path == 'cancel' || path == 'by-user' ) && role != 'customer') ||
        // Checking logistic/courier/seller access
        (
            (
                path == 'accept' || path == 'confirm-delivery' || path == 'by-seller' ||
                path == 'by-logistic' || path == 'by-courier'

            ) && ( role != 'seller' && role != 'logistic' && role != 'courier' )
        )
    ) {
        // If any other roles access these paths, return error response
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else if (
        ( role == 'seller' || role == 'logistic' ) &&
        req.userData.statusConfirmed == false
    ){
        // If seller account is not verified, return error response
        return next(createError(401, "Your account is not verified yet !"));
    }else {
        next();
    }
}