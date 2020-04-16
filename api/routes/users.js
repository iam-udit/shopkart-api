// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");
const userExists = require('../middlewares/user-exists');
const updatePassword = require('../middlewares/update-password');


// Retrieving all user's details
router.get("/getall", verifyJwt, usersController.getAllUsers);

// Retrieving user's details by Id
router.get("/get", verifyJwt, usersController.getUserById);

// Creating new use/ processing signup
router.post("/signup",userExists, usersController.userSignUp);

// Performing login process
router.post("/login", usersController.userLogin);

// Update user details
router.patch("/update", verifyJwt, usersController.updateUser)

// Update user's password
router.patch("/update/password", verifyJwt, updatePassword)

// Delete user records
router.delete('remove/:userId', verifyJwt, usersController.removeUser);

module.exports = router;