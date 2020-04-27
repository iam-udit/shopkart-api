// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");

// Update new password
module.exports.updatePassword = (req, res, next) => {

    // Retrieving user id from userData
    var id = req.userData.id;

    // Getting the model
    var temp = req.originalUrl.split('/')[1];
    // Making model class
    var Model =  require('../models/' + temp.substring(0, temp.length-1));

    // Update password in database
    Model.update({ _id: id }, { $set: { password: req.body.password } })
        .exec()
        .then(result => {

            // If password updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Password updated successfully."
                });
            }
            // If invalid user id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If user's updation failed.
        .catch(error => {
            error.message = "Password updation failed !";
            next(error);
        });
};


// Converting plain password into hash
module.exports.digestPassword = (req, res, next) => {

    bcrypt.hash(req.body.npassword || req.body.password, 10, (error, hash)=> {
        if (error) {
            return next(createError(500, "Password conversion failed."));
        } else {
            req.body.password = hash;
            next();
        }
    });
}


// Update account status
module.exports.forgotPassword = (req, res, next) => {

};