// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");

// Validating user's exists or not
module.exports = function (req, res, next) {

    var query = {};
    // Getting the model
    var temp = req.originalUrl.split('/')[1];
    // Making model class
    var Model =  require('../models/' + temp.substring(0, temp.length-1));

    if ( temp == 'users' ){
        // Query for finding users
        query = { mobileNumber : req.body.mobileNumber };
    } else {
        // Query for finding sellers or logistics
        query = { email : req.body.email };
    }

    Model.findOne( query, (err, user) => {

        if(user){
            // If user already exist then return error response
            return next(createError(409, "User is already exists !"));
        } else if (err){
            // If any error occur
            return next(createError(500, err.message));
        } else {
            // If user not exist, then allow for sign up
            next();
        }

    })
}