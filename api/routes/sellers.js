// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const sellersController = require("../controllers/sellers");
const verifyAccount = require('../middlewares/verify-account');
const { forgotPassword, updatePassword, digestPassword } = require('../middlewares/password-ops');

// Retrieving seller's details by Id
router.get("/get", verifyJwt, sellersController.getSellerById);

// Retrieving all confirmed/unconfirmed seller's details
router.get("/by-status/:statusConfirmed/:offSet?", verifyJwt, sellersController.getAllSellers);

// Retrieving all seller's details
router.get("/get-all/:offSet?", verifyJwt, sellersController.getAllSellers);

// Creating new seller/ processing signup
router.post("/signup", userExists, digestPassword, sellersController.sellerSignUp);

// Performing login process
router.post("/login", sellersController.sellerLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update seller's details
router.put("/update", verifyJwt, upload.single('sellerImage'), sellersController.updateSeller)

// Update seller's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

// Verify seller's account status
router.put("/verify/account/:id", verifyJwt, verifyAccount);

// Delete seller's record
router.delete('/remove/:sellerId', verifyJwt, sellersController.removeSeller);

module.exports = router;