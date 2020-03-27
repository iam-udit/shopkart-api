// Importing all required modules
const express = require("express");
const router = express.Router();
const sanitize = require("../middlewares/sanitize");
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");


// Retrieving all user's details
router.get("/getall", verifyJwt, usersController.getAllUsers);

// Retrieving user's details by Id
router.get("/", verifyJwt, usersController.getUserById);

// Creating new use/ processing signup
router.post("/signup", sanitize, usersController.userSignUp);

// Performing login process
router.post("/login", sanitize, usersController.userLogin);

// Update user details
router.patch("/update", sanitize, verifyJwt, usersController.updateUser)

// Delete user records
router.delete('/remove/:userId', sanitize, verifyJwt, usersController.removeUser);

module.exports = router;