// Importing all required modules
const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verify-jwt");
const sellersController = require("../controllers/sellers");
const upload = require("../middlewares/upload");

// Retrieving all seller's details
router.get("/getall", verifyJwt, sellersController.getAllSellers);

// Retrieving seller's details by Id
router.get("/get", verifyJwt, sellersController.getSellerById);

// Creating new seller/ processing signup
router.post("/signup", sellersController.sellerSignUp);

// Performing login process
router.post("/login", sellersController.sellerLogin);

// Update seller's details
router.patch("/update", verifyJwt, sellersController.updateSeller)

// Delete seller's record
router.delete('/remove/:sellerId', verifyJwt, sellersController.removeSeller);

module.exports = router;