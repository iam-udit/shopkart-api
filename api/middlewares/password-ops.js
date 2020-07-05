// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");

// Create Model class
function createModel(req) {

    let Model = "";

    // Getting the model
    var temp = req.originalUrl.split('/')[1];

    if ( temp !== 'admin' ){
        // Making model class if request from user, seller, logistic
        Model =  require('../models/' + temp.substring(0, temp.length-1));
    } else {
        // Making model class if request from admin
        Model = require('../models/user');
    }

    return Model;
}

// Build query for forgot/update password
function buildQuery(req) {

    let query = {};

    // Splitting the requested path
    var temp = req.originalUrl.split('/');

    // Building query
    if(temp[2] === 'update') {
        // Querying for update password
        query = { _id: req.userData.id };
    } else if (temp[2] === 'forgot') {

        if (temp[1] === "users") {
            // Querying for forgot password if request from users
            query = { mobileNumber: req.body.mobileNumber };
        } else {
            // Querying for forgot password if request form seller, logistic, courier
            query = { email: req.body.email };
        }
    }

    return query;
}

// Update new password
exports.updatePassword = function (req, res, next)  {

    // Building query
    var query = buildQuery(req);

    // Creating model class for request
    var Model = createModel(req);

    // Update password in database
    Model.updateOne(query, { $set: { password: req.body.password } })
        .exec()
        .then((result) => {

            // If password updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Password updated successfully."
                });
            }
            // If invalid user id
            else {
                next(createError(404, "User is not exists !"));
            }

        })
        // If user's updation failed.
        .catch((error) => {
            error.message = "Password updation failed !";
            next(error);
        });
};


// Converting plain password into hash
exports.digestPassword = function (req, res, next) {

    bcrypt.hash(req.body.npassword || req.body.password, 10, (error, hash) => {
        if (error) {
            return next(createError(500, "Password conversion failed."));
        } else {
            req.body.password = hash;
            next();
        }
    });
};

exports.createModel = createModel;