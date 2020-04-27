// Importing all necessary packages
const express = require("express");
const createError = require("http-errors");
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const productsController = require("../controllers/products");
const productExists = require('../middlewares/product-exists');

const router = express.Router();

// Verifying jwt token and verifying the seller's status
router.use( verifyJwt, function (req, res, next) {

    let temp = req.originalUrl.split('/')[2];

    if (req.userData.role == 'seller' && req.userData.statusConfirmed == false){
        // If seller account is not verified, return error response
        return next(createError(401, "Your account is not verified yet !"));
    } else if(temp == 'create' || temp == 'update' || temp == 'remove') {
        // Checking user eligibility
        if(req.userData.role != 'seller' || req.userData.role != 'admin'){
            return  next(createError(401,"You are not an eligible user for this operation !"));
        }
    }
    // If seller account is verified, allow for operation
    next();
} );

// Retrieving product's details by productId form database
router.get('/get/:productId', productsController.getProductById);

// Retrieving all product's details according to productType
router.get('/by-type/:productType/:offSet?', productsController.getAllProducts);

// Retrieving all product's details according to sellerId
router.get('/by-seller/:sellerId/:offSet?', productsController.getAllProducts);

// Retrieving all product's details form database
router.get('/get-all/:offSet?', productsController.getAllProducts);

// Creating new product
router.post('/create/', productExists,  upload.array('productImages', 6 ), productsController.createProduct);

// Delete product
router.delete('/remove/:productId', productsController.deleteProduct);

// Update Product details
router.put('/update/:productId', productExists, upload.array('productImages', 6 ), productsController.updateProduct);

// Export module
module.exports = router;