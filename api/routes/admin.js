// Importing all required modules
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const verifyJwt = require("../middlewares/verify-jwt");
const usersController = require("../controllers/users");
const { updatePassword, digestPassword } = require('../middlewares/password-ops');

// Retrieving admin details
router.get("/get", verifyJwt, usersController.getUserById);

// Performing admin login process
router.post("/login", usersController.userLogin);

// Update admin details
router.put("/update", verifyJwt, upload.single('userImage'), usersController.updateUser)

// Update admin's password
router.put("/update/password", verifyJwt, digestPassword, updatePassword)

module.exports = router;