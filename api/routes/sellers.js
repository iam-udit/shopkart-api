// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const sellersController = require("../controllers/sellers");
const verifyAccount = require('../middlewares/verify-account');
const updatePassword = require('../middlewares/update-password');

// Retrieving all confirmed/unconfirmed/total seller's details
router.get("/getall/:statusConfirmed?", verifyJwt, sellersController.getAllSellers);

// Retrieving seller's details by Id
router.get("/get", verifyJwt, sellersController.getSellerById);

// Creating new seller/ processing signup
router.post("/signup", userExists, sellersController.sellerSignUp);

// Performing login process
router.post("/login", sellersController.sellerLogin);

// Update seller's details
router.patch("/update", verifyJwt, sellersController.updateSeller)

// Update seller's password
router.patch("/update/password", verifyJwt, updatePassword)

// Verify seller's account status
router.patch("/verify/account/:id", verifyJwt, verifyAccount);

// Delete seller's record
router.delete('/remove/:sellerId', verifyJwt, sellersController.removeSeller);

module.exports = router;