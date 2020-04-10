// Importing all necessary packages
const express = require("express");
const verifyJwt = require("../middlewares/verify-jwt");
const ordersController = require("../controllers/orders");

const router = express.Router();

// Verifying jwt token
router.use( verifyJwt );

// Retrieving order's details form database
router.get('/:orderId', ordersController.getOrderById);

// Retrieving order's details according to productId
router.get('/product/id/:productId', ordersController.getOrdersByProductId);

// Retrieving order's details according to userId
router.get('/user/id', ordersController.getOrdersByUserId);

// Retrieving all odrder's details form database
router.get('/', ordersController.getAllOrders);

// Creating new order
router.post('/', ordersController.createOrder);

// Delete order
router.delete('/:orderId', ordersController.deleteOrder);

// Export module
module.exports = router;