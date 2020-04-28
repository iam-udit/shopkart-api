// Importing all required modules
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const  jwt = require("jsonwebtoken");
const createError = require("http-errors");

const Logistic = require("../models/logistic");


// Retrieving logistic's details by logisticId
exports.getLogisticById =  (req, res, next) => {

    // Getting logistic's id from userData
    const id = req.userData.id;

    // Finding logistic's details using logistic id.
    Logistic.findById(id, { __v: 0, password: 0 })
        .exec()
        .then(logistic => {
            // if logistic found, return success response
            if (logistic) {
                res.status(200).json({
                    status: 200,
                    message: "Logistic account details",
                    logistic: logistic
                });

            }
            // If logistic doesn't found, return not found response
            else {
                next(createError(404, "Logistic details not found !"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all logistic's details form database
exports.getAllLogistics =  (req, res, next) => {

    var query = {};

    if(req.originalUrl.split('/')[2] == 'by-status'){
        // Query for confirmed/unconfirmed logistics
        query = { statusConfirmed: req.params.statusConfirmed };
    } else {
        // Query for all logistics
        query = {};
    }

    // Finding all logistics details
    Logistic.paginate(query, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If logistics found, return user details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of logistic details",
                    total: result.total,
                    offset: result.offset,
                    pages: Math.ceil(result.total / result.limit ),
                    logistics: result.docs
                }
                res.status(200).json(response);
            }
            // If logistic doesn't found, return empty response
            else {
                next(createError(404, "No logistics found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new logistic/ processing signup
exports.logisticSignUp = (req, res, next)=>{

    // Creating logistic schema object and binding data to it
    const  logistic = new Logistic({
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });

    logistic.save()
        // If logistic account created, return success message
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
                // If logistic account creation failed
                error.message = "User creation failed !";
            }
            next(error);
        });

};

// Performing login process
exports.logisticLogin = (req, res, next)=>{

    // Checking logistic is valid or not
    Logistic.findOne({ email : req.body.email })
        .exec()
        .then(logistic => {
            // If logistic is an existing user then authenticate password
            if(logistic){
                bcrypt.compare(req.body.password, logistic.password, (error, result) => {
                    if(result){
                        // Creating jwt token
                        const token = jwt.sign(
                            {
                                id: logistic._id,
                                role: 'logistic',
                                email : logistic.email,
                            },
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: "1h"
                            }
                        );
                        res.status(200).json({
                            status: 200,
                            message : "Authentication sucesss !",
                            token : token
                        });
                    }else {
                        next(createError(401, "User credential mismatched !" ));
                    }
                });
            }
            // If logistic is not an existing user
            else{
                next(createError(401, "User credential mismatched !" ));
            }
        });
};

// Update logistic's details
exports.updateLogistic = (req, res, next) => {

    // Retrieving logistic id from userData
    const id = req.userData.id;

    // Retrieve update option from request body
    var updateOps = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        logisticImage: req.file.path,
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

    // Update logistic's details in database
    Logistic.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If logistic's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "User's detail updated."
                });
            }
            // If invalid logistic's id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If logistic's updation failed.
        .catch(error => {
            error.message = "User's detail updation failed !";
            next(error);
        });
};

// Delete logistic's records
exports.removeLogistic = (req, res, next) => {

    // Getting logistic's id from request
    const id = req.params.logisticId;

    // Deleting logistic's account from database
    Logistic.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  logistic's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Logistic's record deleted."
                });
            }
            // If invalid logistic id
            else {
                next(createError(404, "Invalid logistic Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "Logistic's record deletion failed !";
            next(error);
        })
};