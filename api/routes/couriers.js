// Importing all required modules
const express = require("express");
const router = express.Router();
const createError = require('http-errors');
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const userExists = require('../middlewares/user-exists');
const couriersController = require("../controllers/couriers");
const { updatePassword, forgotPassword, digestPassword } = require('../middlewares/password-ops');

// Verifying eligibility of the user
function checkPermission (req, res, next){
    if ( req.userData.role != 'logistic' ) {
        // If role is not logistic, then return
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else if (req.userData.role == 'logistic' && req.userData.statusConfirmed == false) {
        // If logistic account is not verifed, then return
        return  next(createError(401,"Your account is not verified yet !"));
    }else {
        next();
    }
}

// Retrieving courier's details by Id
router.get("/get", verifyJwt, couriersController.getCourierById);

// Retrieving all courier's details by logistic Id
router.get("/get-all/:offSet?", verifyJwt, checkPermission, couriersController.getAllCouriers);

// Creating new courier/ processing signup
router.post("/signup", verifyJwt, checkPermission, userExists, digestPassword, couriersController.courierSignUp);

// Performing login process
router.post("/login", couriersController.courierLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update courier's details
router.put("/update", verifyJwt, upload.single('courierImage'), couriersController.updateCourier)

// Update courier's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

// Delete courier's record
router.delete('/remove/:courierId', verifyJwt, checkPermission, couriersController.removeCourier);

module.exports = router;