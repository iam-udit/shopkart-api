// Importing all required modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const createError = require('http-errors');
const utils = require('../middlewares/utils');

// Creating jwt token
function createJWT(user, temp) {
    // Making payload
    let payload = {};

    if (temp === 'admin') {
        // If request from admin
        payload = {
            id: user._id,
            role: 'admin',
            email: user.email,
        };
    }
    if (temp === 'users') {
        // If request from users
        payload = {
            id: user._id,
            role: 'customer',
            mobileNumber: user.mobileNumber,
        };
    }

    // Creating jwt token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h',
    });

    return token;
}

// Retrieving user's details by userId
exports.getUserById = async (req, res, next) => {
    // Getting user's id from userData
    const id = req.userData.id;

    try {
        // Finding user's details using user id.
        const user = await User.findById(id, { __v: 0, password: 0 }).exec();
        // if user found, return success response
        if (user) {
            res.status(200).json({
                status: 200,
                message: 'User account details',
                user: user,
            });
        }
        // If user doesn't found, return not found response
        else {
            next(createError(404, 'User details not found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Retrieving all user's details form database
exports.getAllUsers = async (req, res, next) => {
    // Building query
    let query = { email: { $ne: process.env.ADMIN } };

    try {
        // Finding all users
        const result = await User.paginate(query, {
            page: req.params.offSet || 1,
            limit: 20,
        });
        // If users found, return user details
        if (result.totalDocs > 0) {
            // mongoose-paginate-v2 uses totalDocs
            const response = {
                status: 200,
                message: 'A list of user details',
                total: result.totalDocs,
                pages: result.totalPages,
                offset: parseInt(result.page, 10),
                users: result.docs,
            };
            res.status(200).json(response);
        }
        // If user doesn't found, return empty response
        else {
            next(createError(404, 'No users found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Creating new use/ processing signup
exports.userSignUp = async (req, res, next) => {
    // Creating user schema object and binding data to it
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        mobileNumber: req.body.mobileNumber,
        password: req.body.password,
    });

    try {
        // If user created, return success message
        await user.save();
        res.status(201).json({
            status: 201,
            message: 'User Created Successfully.',
        });
    } catch (error) {
        // If any error occure return error message
        let newError = error;
        if (error._message) {
            // Mongoose validation error
            newError = new Error(error.message);
            newError.status = 400; // Bad request
        } else {
            newError = createError(
                500,
                'User registration failed ! due to: ' + error.message
            );
        }
        next(newError);
    }
};

// Performing login process
exports.userLogin = async (req, res, next) => {
    let query = {};
    let temp = req.originalUrl.split('/')[1];

    // Buildiing query
    if (temp === 'users') {
        // Building query for users login
        query = { mobileNumber: req.body.mobileNumber };
    } else if (temp === 'admin') {
        // Building query for admin login
        query = { email: req.body.email };
    }

    try {
        // Checking user is valid or not
        const user = await User.findOne(query).exec();

        // If user is an existing user then authenticate password
        if (user) {
            const passwordMatch = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (passwordMatch) {
                // Create Jwt
                let token = createJWT(user, temp);
                res.status(200).json({
                    status: 200,
                    message: 'Authentication sucesss !',
                    token: token,
                });
            } else {
                next(createError(401, 'User credential mismatched !'));
            }
        }
        // If user is not an existing user
        else {
            next(createError(401, 'User credential mismatched !'));
        }
    } catch (error) {
        next(error);
    }
};

// Update users details
exports.updateUser = async (req, res, next) => {
    try {
        // Retrieve update option from request body
        var updateOps = await utils.updateUserOps(req);

        // Update user's details in database
        // Using updateOne instead of deprecated update. The original was already using updateOne effectively.
        const result = await User.updateOne(
            { _id: req.userData.id },
            { $set: updateOps }
        ).exec();

        // If user's details updated successfully, return success response
        // Check modifiedCount for Mongoose v6+ or nModified for older versions
        if (result.modifiedCount > 0 || result.nModified > 0) {
            await res.status(200).json({
                status: 200,
                message: 'User details updated',
            });
        } else {
            // If invalid user id
            next(createError(404, 'Invalid user Id !'));
        }
    } catch (error) {
        // If user's updation failed.
        error.message = 'User details updation failed !';
        next(error);
    }
};

// Delete user records
exports.removeUser = async (req, res, next) => {
    // Getting user's id from request
    const id = req.params.userId;

    try {
        // Deleting user's account from database
        // Using deleteOne instead of deprecated remove
        const result = await User.deleteOne({ _id: id }).exec();

        // If  user's deleted successfully, return success response
        // Check deletedCount for Mongoose v6+
        if (result.deletedCount > 0) {
            res.status(200).json({
                status: 200,
                message: 'User record deleted.',
            });
        }
        // If invalid user id
        else {
            next(createError(404, 'Invalid user Id !'));
        }
    } catch (error) {
        // If any error occurs, return error response
        const newError = createError(
            500,
            "User's record deletion failed! Due to: " + error.message
        );
        next(newError);
    }
};
