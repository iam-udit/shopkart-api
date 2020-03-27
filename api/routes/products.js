// Importing all necessary packages
const express = require("express");
const sanitize = require("../middlewares/sanitize");
const verifyJwt = require("../middlewares/verify-jwt");
const productsController = require("../controllers/products");

const router = express.Router();

// Retrieving product's details form database
router.get('/:productId', sanitize, verifyJwt, productsController.getProductById);

// Retrieving product's details according to productType
router.get("/type/:productType", sanitize, verifyJwt, productsController.getProductsByType);

// Retrieving all product's details form database
router.get("/", verifyJwt, productsController.getAllProducts);

// Creating new product
router.post('/', sanitize, verifyJwt, productsController.createProduct);

// Delete product
router.delete('/:productId', sanitize, verifyJwt, productsController.deleteProduct);

// Update Product details
router.patch("/:productId", sanitize, verifyJwt, productsController.updateProduct);

// Export module
module.exports = router;