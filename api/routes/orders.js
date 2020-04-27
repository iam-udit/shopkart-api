// Importing all necessary packages
const express = require("express");
const verifyJwt = require("../middlewares/verify-jwt");
const ordersController = require("../controllers/orders");

const router = express.Router();

// Verifying jwt token and seller account verification
router.use( verifyJwt, function (req, res, next) {
    if (req.userData.role == 'seller' && req.userData.statusConfirmed == false){
        // If seller account is not verified, return error response
        return next(createError(401, "Your account is not verified yet !"));
    } else {
        next();
    }
} );

// Retrieving order's details by orderId form database
router.get('/get/:orderId', ordersController.getOrderById);

// Retrieving order's details according to userId
router.get('/by-user/:userId/:offSet?', ordersController.getAllOrders);

// Retrieving order's details according to productId
router.get('/by-product/:productId/:offSet?', ordersController.getAllOrders);

// Retrieving all odrder's details form database
router.get('/get-all/:offSet?', ordersController.getAllOrders);

// Creating new order
router.post('/create/', ordersController.createOrder);

// Delete order
router.delete('/remove/:orderId', ordersController.deleteOrder);

// Export module
module.exports = router;