// Importing all required modules
const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");
const upload = require("../middlewares/upload");

// Retrieving all user's details
router.get("/getall", verifyJwt, usersController.getAllUsers);

// Retrieving user's details by Id
router.get("/get", verifyJwt, usersController.getUserById);

// Creating new use/ processing signup
router.post("/signup", usersController.userSignUp);

// Performing login process
router.post("/login", usersController.userLogin);

// Update user details
router.patch("/update", verifyJwt, usersController.updateUser)

// Delete user records
router.delete('remove/:userId', verifyJwt, usersController.removeUser);

module.exports = router;