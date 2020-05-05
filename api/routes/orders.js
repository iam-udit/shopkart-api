// Importing all necessary packages
const express = require("express");
const verifyJwt = require("../middlewares/verify-jwt");
const ordersController = require("../controllers/orders");

const router = express.Router();

// Verifying jwt token and seller account verification
router.use( verifyJwt, function (req, res, next) {

    let role = req.userData.role;
    let path = req.originalUrl.split('/')[2];

    if (
        ( role == 'seller' || role == 'logistic' ) &&
        req.userData.statusConfirmed == false
    ){
        // If seller account is not verified, return error response
        return next(createError(401, "Your account is not verified yet !"));
    } else if (
        ( role != 'seller' && role != 'logistic' && role != 'courier' ) &&
        ( path == 'accept' || path == 'confirm-delivery' )
    ) {
        // If any other roles access these paths, return error response
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else {
        next();
    }
} );

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