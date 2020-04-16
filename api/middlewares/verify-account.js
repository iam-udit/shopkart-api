// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");

// Update account status
module.exports = (req, res, next) => {

    // Getting the model
    var temp = req.originalUrl.split('/')[1];
    // Making model class
    var Model =  require('../models/' + temp.substring(0, temp.length-1));

    // Confirm account status
    Model.update({ _id: req.params.id }, { $set: { statusConfirmed: true } })
        .exec()
        .then(result => {

            // If confirmation successful, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    message: "Account Verified"
                });
            }
            // If invalid user id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If verification failed.
        .catch(error => {
            error.message = "Verification failed !";
            next(error);
        });
};