// Importing all required modules
const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const  jwt = require("jsonwebtoken");

const Logistic = require("../models/logistic");


// Retrieving logistic's details by logisticId
exports.getLogisticById =  (req, res, next) => {

    // Getting logistic's id from userData
    const id = req.userData.id;

    // Finding logistic's details using logistic id.
    User.findById(id)
        .select("_id firstName lastName mobileNumber email emailVarified address logisticImage createdAt updatedAt")
        .exec()
        .then(logistic => {
            // if logistic found, return success response
            if (logistic) {
                res.status(200).json(logistic);
            }
            // If logistic doesn't found, return not found response
            else {
                next(createError(404, "No valid user found for provided ID"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all logistic's details form database
exports.getAllLogistics =  (req, res, next) => {

    // Finding all logistics details
    User.find()
        .select("_id firstName lastName mobileNumber password email emailVarified address logisticImage createdAt updatedAt")
        .exec()
        .then(logistics => {
            // If logistics found, return user details
            if (logistics.length > 1) {
                const response = {
                    count: logistics.length,
                    logistics: logistics
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

    // Validating logistic's exists or not
    User.findOne({ mobileNumber : req.body.mobileNumber})
        .exec()
        .then(logistic => {
            // If logistic already exist then return error response
            if(user){
                next(createError(409, "Mobile number already in use !"));
            }
            // If logistic not exists, create logistic account
            else{
                // Converting plain password into hash
                bcrypt.hash(req.body.password, 10, (error, hash)=>{

                    if(error){
                        if(!req.body.password){
                            error = createError(500, "Password must required.");
                        }else{
                            error = createError(500, "Password conversion failed.");
                        }

                        next(error);
                    } else{
                        // Creating logistic schema object and binding data to it
                        const  logistic = new Logistic({
                            _id: new mongoose.Types.ObjectId(),
                            mobileNumber: req.body.mobileNumber,
                            password: hash
                        });

                        logistic.save()
                            // If logistic account created, return success message
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
                                    // If logistic account creation failed
                                    error.message = "User creation failed !";
                                }
                                next(error);
                            });
                    }
                })
            }
        })
};

// Performing login process
exports.logisticLogin = (req, res, next)=>{

    // Checking logistic is valid or not
    User.findOne({ mobileNumber : req.body.mobileNumber })
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
                                mobileNumber : logistic.mobileNumber,
                            },
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: "1h"
                            }
                        );
                        res.status(200).json({
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

    var updateOps = {};

    // Retrieving logistic id from userData
    const id = req.userData.id;

    // Converting plain password into hash
    bcrypt.hash(req.body.password, 10, (error, hash)=> {

        if (error) {
            if (!req.body.password) {
                error = createError(500, "Password must required.");
            } else {
                error = createError(500, "Password conversion failed.");
            }
            next(error);
        } else {
            // Retrieve update option from request body
            updateOps = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hash,
                email: req.body.email,
                address: req.body.address
            };
        }
    });


    // Update logistic's details in database
    User.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If logistic's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
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
    User.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  logistic's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
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