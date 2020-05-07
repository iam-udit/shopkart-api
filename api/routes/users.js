// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");
const userExists = require('../middlewares/user-exists');
const { checkAdminPermission } = require('../middlewares/utils');
const { updatePassword, forgotPassword, digestPassword } = require('../middlewares/password-ops');


// Check user is exists or not
router.get('/is_exists/:mobileNumber', userExists);

// Retrieving user's details by Id
router.get("/get", verifyJwt, usersController.getUserById);

// Retrieving all user's details
router.get("/get-all/:offSet?", verifyJwt, checkAdminPermission, usersController.getAllUsers);

// Creating new use/ processing signup
router.post("/signup",userExists, digestPassword, usersController.userSignUp);

// Performing login process
router.post("/login", usersController.userLogin);

// Performing forgot password operation
router.post("/forgot/password", userExists, forgotPassword);

// Update user details
router.put("/update", verifyJwt, upload.single('userImage'), usersController.updateUser)

// Update user's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

// Delete user records
router.delete('/remove/:userId', verifyJwt, checkAdminPermission, usersController.removeUser);

module.exports = router;