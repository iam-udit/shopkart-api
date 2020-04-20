// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const  jwt = require("jsonwebtoken");

const User = require("../models/user");


// Retrieving user's details by userId
exports.getUserById =  (req, res, next) => {

    // Getting user's id from userData
    const id = req.userData.id;

    // Finding user's details using user id.
    User.findById(id, { __v: 0, password: 0 })
        .exec()
        .then(user => {
            // if user found, return success response
            if (user) {
                res.status(200).json(user);
            }
            // If user doesn't found, return not found response
            else {
                next(createError(404, "No valid user found for provided ID"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all user's details form database
exports.getAllUsers =  (req, res, next) => {

    // Finding all users
    User.paginate({}, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If users found, return user details
            if (result.total > 0) {
                const response = {
                    total: result.total,
                    pages: Math.ceil(result.total / result.limit),
                    offset: result.offset,
                    users: result.docs,
                }
                res.status(200).json(response);
            }
            // If user doesn't found, return empty response
            else {
                next(createError(404, "No uses found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new use/ processing signup
exports.userSignUp = (req, res, next)=>{

    // Creating user schema object and binding data to it
    const  user = new User({
        _id: new mongoose.Types.ObjectId(),
        mobileNumber: req.body.mobileNumber,
        password: req.body.npassword
    });

    user.save()
        // If user created, return success message
        .then(result => {
            res.status(201).json({
                message: "User Created Successfully."
            });
        })
        // If any error occure return error message
        .catch(error=>{
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else {
                // If user creation failed
                error.message = "User creation failed !";
            }
            next(error);
        });
};

// Performing login process
exports.userLogin = (req, res, next)=>{

    // Checking user is valid or not
    User.findOne({ mobileNumber : req.body.mobileNumber })
        .exec()
        .then(user => {
            // If user is an existing user then authenticate password
            if(user){
                bcrypt.compare(req.body.password, user.password, (error, result) => {
                    if (result) {
                        // Creating jwt token
                        const token = jwt.sign(
                            {
                                id: user._id,
                                mobileNumber: user.mobileNumber,
                            },
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: "1h"
                            }
                        );
                        res.status(200).json({
                            message: "Authentication sucesss !",
                            token: token
                        });
                    } else {
                        next(createError(401, "User credential mismatched !"));
                    }
                });
            }
            // If user is not an existing user
            else{
                next(createError(401, "User credential mismatched !" ));
            }
        });
};

// Update users details
exports.updateUser = (req, res, next) => {

    // Retrieving user id from userData
    const id = req.userData.id;

    // Retrieve update option from request body
    var updateOps = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        address: req.body.address,
        gender: req.body.gender,
        age: req.body.age
    };

    if (req.file.path != undefined) {
        updateOps.userImage =  req.file.path;
    }

    // Update user's details in database
    User.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If user's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    message: "User's detail updated."
                });
            }
            // If invalid user id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If user's updation failed.
        .catch(error => {
            error.message = "User's detail updation failed !";
            next(error);
        });
};

// Delete user records
exports.removeUser = (req, res, next) => {

    // Getting user's id from request
    const id = req.params.userId;

    // Deleting user's account from database
    User.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  user's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "User record deleted."
                });
            }
            // If invalid user id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "User's record deletion failed !";
            next(error);
        })
};