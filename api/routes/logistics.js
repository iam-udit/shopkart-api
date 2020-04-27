// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const verifyAccount = require('../middlewares/verify-account');
const logisticsController = require("../controllers/logistics");
const { updatePassword, forgotPassword, digestPassword } = require('../middlewares/password-ops');


// Retrieving logistic's details by Id
router.get("/get", verifyJwt, logisticsController.getLogisticById);

// Retrieving all confirmed/unconfirmed/total logistic's details
router.get("/by-status/:statusConfirmed/:offSet?", verifyJwt, logisticsController.getAllLogistics);

// Retrieving all logistic's details
router.get("/get-all/:offSet?", verifyJwt, logisticsController.getAllLogistics);

// Creating new logistic/ processing signup
router.post("/signup", userExists, digestPassword, logisticsController.logisticSignUp);

// Performing login process
router.post("/login", logisticsController.logisticLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update logistic's details
router.put("/update", verifyJwt, upload.single('logisticImage'), logisticsController.updateLogistic)

// Update logistic's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

// Verify logistic's account status
router.put("/verify/account/:id", verifyJwt, verifyAccount);

// Delete logistic's record
router.delete('/remove/:logisticId', verifyJwt, logisticsController.removeLogistic);

module.exports = router;