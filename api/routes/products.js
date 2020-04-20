// Importing all necessary packages
const express = require("express");
const createError = require("http-errors");
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const productsController = require("../controllers/products");

const router = express.Router();

// Verifying jwt token and verifying the seller's status
router.use( verifyJwt, function (req, res, next) {

    if (req.userData.statusConfirmed == false){
        // If seller account is not verified, return error response
        next(createError(401, "Your account is not verified yet !"));
    } else {
        // If seller account is verified, allow for operation
        next();
    }
} );


// Retrieving all product's details form database
router.get('/:offSet?', productsController.getAllProducts);

// Retrieving product's details by productId form database
router.get('/:productId', productsController.getProductById);

// Retrieving all product's details according to productType
router.get('/type/:productType/:offSet?', productsController.getAllProducts);

// Creating new product
router.post('/', upload.array('productImages', 6 ), productsController.createProduct);

// Delete product
router.delete('/:productId', productsController.deleteProduct);

// Update Product details
router.patch('/:productId', upload.array('productImages', 6 ), productsController.updateProduct);

// Export module
module.exports = router;