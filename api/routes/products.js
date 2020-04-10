// Importing all necessary packages
const express = require("express");
const verifyJwt = require("../middlewares/verify-jwt");
const productsController = require("../controllers/products");
const upload = require("../middlewares/upload");

const router = express.Router();

// Verifying jwt token
router.use( verifyJwt );

// Retrieving product's details form database
router.get('/:productId', productsController.getProductById);

// Retrieving product's details according to productType
router.get('/type/:productType', productsController.getProductsByType);

// Retrieving all product's details form database
router.get('/', productsController.getAllProducts);

// Creating new product
router.post('/', upload.array('productImages', 6 ), productsController.createProduct);

// Delete product
router.delete('/:productId', productsController.deleteProduct);

// Update Product details
router.patch('/:productId', upload.array('productImages', 6 ), productsController.updateProduct);

// Export module
module.exports = router;