// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const couriersController = require("../controllers/couriers");
const { updatePassword, forgotPassword, digestPassword } = require('../middlewares/password-ops');

// Retrieving courier's details by Id
router.get("/get", verifyJwt, couriersController.getCourierById);

// Retrieving all courier's details by logistic Id
router.get("/get-all/:offSet?", verifyJwt, couriersController.getAllCouriers);

// Creating new courier/ processing signup
router.post("/signup", verifyJwt, userExists, digestPassword, couriersController.courierSignUp);

// Performing login process
router.post("/login", couriersController.courierLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update courier's details
router.put("/update", verifyJwt, upload.single('courierImage'), couriersController.updateCourier)

// Update courier's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

// Delete courier's record
router.delete('/remove/:courierId', verifyJwt, couriersController.removeCourier);

module.exports = router;