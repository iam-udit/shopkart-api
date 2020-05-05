// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");
const adminController = require("../controllers/admin");
const { updatePassword, digestPassword } = require('../middlewares/password-ops');

// Performing admin login process
router.post("/login", usersController.userLogin);

// Checking user eligibility
router.use(verifyJwt, function (req, res, next) {
    let path = req.originalUrl.split('/')[2];
    if ( path != 'login' && req.userData.role != 'admin'){
        return  next(createError(401,"You are not an eligible user for this operation !"));
    } else {
        next();
    }
});

// Retrieving admin details
router.get("/get", usersController.getUserById);

// Getting total supply
router.get("/get/total_supply", adminController.getTotalSupply);

// Getting available supply
router.get("/get/available_supply", adminController.getAvailableSupply);

// Performing admin token initialization operation
router.post("/init/token", adminController.initEcomToken);

// Performing admin token addition operation
router.put("/add/token", adminController.addEcomToken);

// Update admin details
router.put("/update", upload.single('userImage'), usersController.updateUser)

// Update admin's password
router.put("/update/password", digestPassword, updatePassword)

module.exports = router;