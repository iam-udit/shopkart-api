// Importing all necessary packages
const path = require('path');
const express = require("express");
const createError = require("http-errors");
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const productsController = require("../controllers/products");

const router = express.Router();

// Verifying user eligibility and seller status
function checkPermission(req, res, next) {

    let temp = req.originalUrl.split('/')[2];

    if (req.userData.role == 'seller' && req.userData.statusConfirmed == false){
        // If seller account is not verified, return error response
        return next(createError(401, "Your account is not verified yet !"));
    } else if(req.userData.role != 'seller' && req.userData.role != 'admin') {
        // Checking user eligibility
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else {
        // If seller account is verified, allow for operation
        next();
    }
}

// Retrieving product's details by productId form database
router.get('/get/:productId', productsController.getProduct);

// Retrieving product's details by productTitle form database
router.get('/by-title/:productTitle', productsController.getProduct);

// Retrieving all product's details according to productType
router.get('/by-type/:productType/:offSet?', productsController.getAllProducts);

// Retrieving all product's details according to matched text
router.get('/by-search/:text/:offSet?', productsController.getAllProducts);

// Retrieving all product's details according to sellerId
router.get('/by-seller/:sellerId/:offSet?', verifyJwt, checkPermission, productsController.getAllProducts);

// Retrieving all product's details form database
router.get('/get-all/:offSet?', productsController.getAllProducts);

// Creating new product
router.post('/create/', verifyJwt, checkPermission,  upload.array('productImages', 6 ), productsController.createProduct);

// Update Product details
router.put('/update/:productId', verifyJwt, checkPermission, upload.array('productImages', 6 ), productsController.updateProduct);

// Delete product
router.delete('/remove/:productId', verifyJwt, checkPermission, productsController.deleteProduct);

// Export module
module.exports = router;