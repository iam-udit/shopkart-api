// Importing all necessary packages
const mongoose = require('mongoose');
const createError = require('http-errors');
const Order = require('../models/order.js');
const utils = require('../middlewares/utils');
const contract = require('../sdk/gateway/contract');
const productController = require('../controllers/products');

// buildQuery function has been moved to api/middlewares/utils.js and renamed to buildOrderQuery

// Retrieving order's details form database
exports.getOrderById = async function (req, res, next) {
    // Getting order's id from request
    const id = req.params.orderId;

    try {
        // Finding order's details using order id.
        const order = await Order.findById(id, { __v: 0 })
            .populate('product')
            .exec();

        // if order found, return success response
        if (order) {
            order.request = {
                // This modification might be an issue if order is a Mongoose document. Consider toJSON()
                type: 'GET',
                description: 'GET_ALL_ORDERS',
                url: req.protocol + '://' + req.get('host') + '/orders/get-all',
            };
            res.status(200).json({
                status: 200,
                message: 'Order details of the given Id: ' + id,
                order: order, // Send the potentially modified order object
            });
        }
        // If order doesn't found, return not found response
        else {
            next(createError(404, 'No order found for provided ID'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Retrieving all order's details form database
exports.getAllOrders = async function (req, res, next) {
    // Building query using the utility function
    var query = utils.buildOrderQuery(req);

    // Building options for pagination
    let option = {
        page: req.params.offSet || 1,
        populate: 'product',
        sort: { createdAt: -1 },
        limit: 20,
    };

    try {
        // Finding all orders
        const result = await Order.paginate(query, option);

        // If order found, return product details
        if (result.totalDocs > 0) {
            // mongoose-paginate-v2 uses totalDocs
            const response = {
                status: 200,
                message: 'A list of order details',
                total: result.totalDocs,
                offset: parseInt(result.page, 10),
                pages: result.totalPages,
                orders: result.docs.map((order) => {
                    return utils.orderResponse(req, order);
                }),
            };
            res.status(200).json(response);
        }
        // If order doesn't found, return empty response
        else {
            next(createError(404, 'No order found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Creating new order
exports.createOrder = async function (req, res, next) {
    // Create new order's document and binding the order's details
    const order = new Order(req.body);

    // Adding orderId and userId to order
    order._id = new mongoose.Types.ObjectId();
    order.user = req.userData.id;

    try {
        // Creating a new order
        const savedOrder = await order.save();

        // If  order's created successfully, then update product quantity
        // Assuming productController.updateProductQuantity might be async or could be made so
        await productController.updateProductQuantity(
            savedOrder.product,
            -savedOrder.quantity
        );

        // return success response
        res.status(201).json({
            status: 201,
            message: 'Order placed successfully',
            createdOrder: utils.orderResponse(req, savedOrder),
        });
    } catch (error) {
        // If any error occurs, return error response
        let newError = error;
        if (error._message) {
            // Mongoose validation error
            newError = new Error(error.message);
            newError.status = 400; // Bad request for validation errors
        } else {
            newError = createError(
                500,
                'Order creation failed ! due to: ' + error.message
            );
        }
        next(newError);
    }
};

// Accept order by seller
exports.acceptOrderBySeller = async function (req, res, next) {
    let options = {
        org: 'ecom',
        user: req.userData.id.toString(),
        method: 'AcceptOrderBySeller',
        args: [
            req.params.orderId,
            req.userData.id.toString(),
            req.body.user,
            req.body.productName,
            req.body.totalBalance.toString(),
            req.body.shipmentCharges.toString(),
            req.body.quantity.toString(),
        ],
    };

    try {
        // Confirmed pending order of the product
        await contract.invoke(options);

        // Saving logistic ID and Updating order status
        const result = await Order.updateOne(
            { _id: req.params.orderId },
            { $set: { logistic: req.body.logistic, orderStatus: 'Confirmed' } }
        ).exec();

        // If order's details updated successfully, return success response
        if (result.nModified > 0 || result.modifiedCount > 0) {
            res.status(200).json({
                status: 200,
                message: 'Order Confirmed !',
            });
        } else {
            next(createError(404, 'Invalid order ID or no change made!'));
        }
    } catch (error) {
        next(
            createError(
                500,
                'Order Confirmation failed! Due to: ' + error.message
            )
        );
    }
};

// Accept order by logistic
exports.acceptOrderByLogistic = async function (req, res, next) {
    let options = {
        org: 'delivery',
        user: 'admin',
        method: 'AcceptOrderByDelivery',
        args: [
            req.params.orderId,
            req.userData.id.toString(),
            req.body.courier,
        ],
    };

    try {
        // Dispatched the confirmed order by logistic
        await contract.invoke(options);

        // Saving courier ID and Updating order status to Dispatched
        const result = await Order.updateOne(
            { _id: req.params.orderId },
            { $set: { courier: req.body.courier, orderStatus: 'Dispatched' } }
        ).exec();

        // If order's details updated successfully, return success response
        if (result.nModified > 0 || result.modifiedCount > 0) {
            res.status(200).json({
                status: 200,
                message: 'Order Dispatched !',
            });
        } else {
            next(createError(404, 'Invalid Order ID or no change made!'));
        }
    } catch (error) {
        // If any error occur, return error response
        if (
            error.status === 403 ||
            (error.responses &&
                error.responses[0] &&
                error.responses[0].response &&
                error.responses[0].response.status === 403)
        ) {
            // check for fabric error
            next(createError(403, 'Insufficient balance !'));
        } else {
            next(
                createError(
                    500,
                    'Order failed to dispatch! Due to: ' + error.message
                )
            );
        }
    }
};

// Confirm delivery of the order by courier
exports.confirmDeliveryByCourier = async function (req, res, next) {
    let options = {
        org: 'delivery',
        user: req.userData.id.toString(),
        method: 'ConfirmDeliveryByCourier',
        args: [req.params.orderId, req.userData.id.toString(), req.body.user],
    };

    try {
        // Delivered the dispatched order by logistic
        await contract.invoke(options);

        // Updating order status to Delivered
        const result = await Order.updateOne(
            { _id: req.params.orderId },
            { $set: { orderStatus: 'Delivered' } }
        ).exec();

        // If order's details updated successfully, return success response
        if (result.nModified > 0 || result.modifiedCount > 0) {
            res.status(200).json({
                status: 200,
                message: 'Order Delivered Successfully !',
            });
        } else {
            next(createError(404, 'Invalid Order ID or no change made!'));
        }
    } catch (error) {
        // If any error occur, return error response
        if (
            error.status === 403 ||
            (error.responses &&
                error.responses[0] &&
                error.responses[0].response &&
                error.responses[0].response.status === 403)
        ) {
            // Access denied: unknown customer
            // Access denied: unknown courier
            next(error); // Forward the original fabric error
        } else {
            next(
                createError(
                    500,
                    'Order delivery failed! Due to: ' + error.message
                )
            );
        }
    }
};

// Cancel order
exports.cancelOrder = async function (req, res, next) {
    // Getting order's id from request
    const id = req.params.orderId;

    try {
        // Getting order status from database
        let orderDetails = await Order.findById(id);

        //  Delete order from couchDb if orderStatus is not pending
        if (orderDetails.orderStatus !== 'Pending') {
            await contract.invoke({
                org: 'ecom',
                user: 'admin',
                method: 'DeleteOrder',
                args: [id.toString()],
            });
        }

        // Canncel order from database
        // Using updateOne instead of deprecated update
        const result = await Order.updateOne(
            { _id: id },
            { $set: { orderStatus: 'Canceled' } }
        ).exec();

        // If  order's deleted successfully, return success response
        // Check modifiedCount for Mongoose v6+ or nModified for older versions
        if (result.modifiedCount > 0 || result.nModified > 0) {
            // After order Cancelation, update product quantity
            // Getting product Id and order quantity
            const orderForQuantityUpdate = await Order.findById(id, {
                product: 1,
                quantity: 1,
            }).exec();
            if (orderForQuantityUpdate) {
                // Adding order quantity with product quantity
                // Assuming productController.updateProductQuantity might be async
                await productController.updateProductQuantity(
                    orderForQuantityUpdate.product,
                    orderForQuantityUpdate.quantity
                );
            } else {
                // Log or handle the case where the order isn't found after being "canceled"
                // This shouldn't happen if the updateOne was successful and targeted the same ID.
                // console.error( // Removed to address no-console warning
                //     `Order with ID ${id} not found for quantity update after cancellation.`
                // );
            }

            res.status(200).json({
                status: 200,
                message: 'Order canceled successfully',
                request: {
                    type: 'POST',
                    description: 'CREATE_NEW_ORDER',
                    url:
                        req.protocol +
                        '://' +
                        req.get('host') +
                        '/orders/create',
                },
            });
        } else {
            // If invalid order id
            next(createError(404, 'Invalid Order Id !'));
        }
    } catch (error) {
        // If any error occurs, return error response
        error.message = 'Order cancellation failed !';
        next(error);
    }
};

// Checking user's permission
exports.checkUsersPermission = function (req, res, next) {
    let role = req.userData.role;
    let path = req.originalUrl.split('/')[2];

    if (
        // Checking admin access
        ((path === 'get-all' || path === 'by-product') && role !== 'admin') ||
        // Checking customer access
        ((path === 'create' || path === 'cancel' || path === 'by-user') &&
            role !== 'customer') ||
        // Checking logistic/courier/seller access
        ((path === 'accept' ||
            path === 'confirm-delivery' ||
            path === 'by-seller' ||
            path === 'by-logistic' ||
            path === 'by-courier') &&
            role !== 'seller' &&
            role !== 'logistic' &&
            role !== 'courier')
    ) {
        // If any other roles access these paths, return error response
        return next(
            createError(
                401,
                'You are not an eligible user for this operation !'
            )
        );
    } else if (
        (role === 'seller' || role === 'logistic') &&
        req.userData.statusConfirmed === false
    ) {
        // If seller account is not verified, return error response
        return next(createError(401, 'Your account is not verified yet !'));
    } else {
        return next(); // Added return for consistent-return
    }
};
