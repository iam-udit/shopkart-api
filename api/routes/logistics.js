// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const verifyAccount = require('../middlewares/verify-account');
const logisticsController = require("../controllers/logistics");
const { updatePassword, forgotPassword, digestPassword } = require('../middlewares/password-ops');


// Retrieving all logistic's details
router.get("/getall", verifyJwt, logisticsController.getAllLogistics);

// Retrieving logistic's details by Id
router.get("/get", verifyJwt, logisticsController.getLogisticById);

// Creating new logistic/ processing signup
router.post("/signup", userExists, digestPassword, logisticsController.logisticSignUp);

// Performing login process
router.post("/login", logisticsController.logisticLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update logistic's details
router.patch("/update", verifyJwt, logisticsController.updateLogistic)

// Update logistic's password
router.patch("/update/password", verifyJwt, digestPassword, updatePassword)

// Verify logistic's account status
router.patch("/verify/account/:id", verifyJwt, verifyAccount);

// Delete logistic's record
router.delete('/remove/:logisticId', verifyJwt, logisticsController.removeLogistic);

module.exports = router;