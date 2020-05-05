// Importing all necessary packages
const express = require("express");
const createError = require('http-errors');
const verifyJwt = require("../middlewares/verify-jwt");
const ordersController = require("../controllers/orders");

const router = express.Router();

// Verifying jwt token and verifying user' role
router.use( verifyJwt, ordersController.checkUsersPermission);

// Retrieving order's details by orderId from database
router.get('/get/:orderId', ordersController.getOrderById);

// Retrieving order's details according to userId
router.get('/by-user/:offSet?', ordersController.getAllOrders);

// Retrieving order's details according to sellerId
router.get('/by-seller/:status/:offSet?', ordersController.getAllOrders);

// Retrieving order's details according to logisticId
router.get('/by-logistic/:status/:offSet?', ordersController.getAllOrders);

// Retrieving order's details according to courierId
router.get('/by-courier/:status/:offSet?', ordersController.getAllOrders);

// Retrieving order's details according to productId
router.get('/by-product/:productId/:offSet?', ordersController.getAllOrders);

// Retrieving all odrder's details form database
router.get('/get-all/:offSet?', ordersController.getAllOrders);

// Creating new order
router.post('/create/', ordersController.createOrder);

// Accept order by seller
router.put('/accept/by-seller/:orderId', ordersController.acceptOrderBySeller);

// Accept order by logistic
router.put('/accept/by-logistic/:orderId', ordersController.acceptOrderByLogistic);

// Confirm the delivery of order by courier
router.put('/confirm-delivery/:orderId', ordersController.confirmDeliveryByCourier);

// Cancel order by the user
router.delete('/cancel/:orderId', ordersController.cancelOrder);

// Export module
module.exports = router;