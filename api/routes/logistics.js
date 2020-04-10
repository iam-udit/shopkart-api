// Importing all required modules
const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verify-jwt");
const logisticsController = require("../controllers/logistics");
const upload = require("../middlewares/upload");

// Retrieving all logistic's details
router.get("/getall", verifyJwt, logisticsController.getAllLogistics);

// Retrieving logistic's details by Id
router.get("/get", verifyJwt, logisticsController.getLogisticById);

// Creating new logistic/ processing signup
router.post("/signup", logisticsController.logisticSignUp);

// Performing login process
router.post("/login", logisticsController.logisticLogin);

// Update logistic's details
router.patch("/update", verifyJwt, logisticsController.updateLogistic)

// Delete logistic's record
router.delete('remove/:logisticId', verifyJwt, logisticsController.removeLogistic);

module.exports = router;