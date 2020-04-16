// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");

// Update new password
module.exports = (req, res, next) => {

    // Retrieving user id from userData
    const id = req.userData.id;

    // Getting the model
    var temp = req.originalUrl.split('/')[1];
    // Making model class
    var Model =  require('../models/' + temp.substring(0, temp.length-1));

    // Converting plain password into hash
    bcrypt.hash(req.body.npassword, 10, (error, hash)=> {

        if (error) {
            next(createError(500, "Password conversion failed."));
        }

        // Update password in database
        Model.update({ _id: id }, { $set: { password: hash } })
            .exec()
            .then(result => {

                // If password updated successfully, return success response
                if (result.nModified > 0) {
                    res.status(200).json({
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
    });
};