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
                // Remove emailVerified field from user for admin request
                if (req.originalUrl.split('/')[1] == 'admin') {
                    delete user.emailVerified;
                }
                res.status(200).json({
                    status: 200,
                    message: "User details of the given Id: " + id,
                    user: user
                });
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
    User.paginate({ email : { $ne: process.env.ADMIN } }, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If users found, return user details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of user details",
                    total: result.total,
                    pages: Math.ceil(result.total / result.limit),
                    offset: result.offset,
                    users: result.docs,
                }
                res.status(200).json(response);
            }
            // If user doesn't found, return empty response
            else {
                next(createError(404, "No users found !"));
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
        password: req.body.password
    });

    user.save()
        // If user created, return success message
        .then(result => {
            res.status(201).json({
                status: 201,
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
                error.message = "User registration failed !";
            }
            next(error);
        });
};

// Performing login process
exports.userLogin = (req, res, next)=>{

    let query = {};
    let temp = req.originalUrl.split('/')[1];
    if (temp == 'users'){
        // Building query for users login
        query = { mobileNumber : req.body.mobileNumber };
    } else if ( temp == 'admin'){
        // Building query for admin login
        query = { email : req.body.email };

    }
    // Checking user is valid or not
    User.findOne(query)
        .exec()
        .then(user => {
            // If user is an existing user then authenticate password
            if(user){
                bcrypt.compare(req.body.password, user.password, (error, result) => {
                    if (result) {

                        let payload = {
                            id: user._id,
                            role: 'customer',
                            mobileNumber : user.mobileNumber
                        };

                        // If request from admin, make payload
                       if ( temp == 'admin'){
                            payload.role = 'admin';
                            payload.email = user.email;
                            delete payload.mobileNumber;
                        }

                        // Creating jwt token
                        const token = jwt.sign(
                            payload,
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: "1h"
                            });
                        res.status(200).json({
                            status: 200,
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
        address: {
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zip: req.body.zip,
            body: req.body.body
        },
        gender: req.body.gender,
        age: req.body.age
    };

    // If request from admin, modify updateOps
    if (req.originalUrl.split('/')[1] == 'admin') {
        delete updateOps.email;
        updateOps.mobileNumber = req.body.mobileNumber;
    }

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
                    status: 200,
                    message: "User details updated"
                });
            }
            // If invalid user id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If user's updation failed.
        .catch(error => {
            error.message = "User details updation failed !";
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
                    status: 200,
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