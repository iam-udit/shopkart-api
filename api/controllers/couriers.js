// Importing all required modules
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const  jwt = require("jsonwebtoken");
const createError = require("http-errors");
const wallet = require('../sdk/gateway/wallet');

const Courier = require("../models/courier");


// Retrieving courier's details by courierId
exports.getCourierById =  (req, res, next) => {

    // Getting courier's id from userData
    const id = req.userData.id;

    // Finding courier's details using courier id.
    Courier.findById(id, { __v: 0, password: 0 })
        .exec()
        .then(courier => {
            // if courier found, return success response
            if (courier) {
                res.status(200).json({
                    status: 200,
                    message: "Courier account details",
                    courier: courier
                });

            }
            // If courier doesn't found, return not found response
            else {
                next(createError(404, "Courier details not found !"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all courier's details by logistic Id
exports.getAllCouriers =  (req, res, next) => {

    // Verifying eligibility of the user
    if ( req.userData.role != 'logistic' ) {
        // If role is not logistic, then return
        return  next(createError(401,"You are not an eligible user for this operation !"));
    }

    // Getting logistic's id from userData
    const logistiId = req.userData.id;

    // Finding all logistics details
    Courier.paginate( { logistic: logistiId }, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If couriers found, return courier details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of courier details",
                    total: result.total,
                    offset: result.offset,
                    pages: Math.ceil(result.total / result.limit ),
                    couriers: result.docs
                }
                res.status(200).json(response);
            }
            // If courier doesn't found, return empty response
            else {
                next(createError(404, "No couriers found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new courier/ processing signup
exports.courierSignUp = (req, res, next)=>{

    // Verifying eligibility of the user
    if ( req.userData.role != 'logistic' ) {
        // If role is not logistic, then return
        return  next(createError(401,"You are not an eligible user for this operation !"));
    }

    // Creating id for courier registration
    let id = new mongoose.Types.ObjectId();
    // Register, enroll and import the courier identity in wallet
    wallet.importIdentity({
        id: id.toString(),
        org: 'delivery',
        msp: 'deliveryMSP',
        role: '',
        affiliation: ''
    },(error) => {
        // If any error occur then return error response
        next(error);
    });

    // Creating courier schema object and binding data to it
    const  courier = new Courier({
        _id: id,
        logistic: req.userData.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });

    courier.save()
        // If courier account created, return success message
        .then(result => {
            res.status(201).json({
                status: 201,
                message: "Courier account Created"
            });
        })
        // If any error occur return error message
        .catch(error=>{
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else {
                // If courier account creation failed
                error.message = "Courier account creation failed !";
            }
            next(error);
        });

};

// Performing login process
exports.courierLogin = (req, res, next)=>{

    // Checking courier is valid or not
    Courier.findOne({ email : req.body.email })
        .exec()
        .then(courier => {
            // If courier is an existing user then authenticate password
            if(courier){
                bcrypt.compare(req.body.password, courier.password, (error, result) => {
                    if(result){
                        // Creating jwt token
                        const token = jwt.sign(
                            {
                                id: courier._id,
                                role: 'courier',
                                email : courier.email,
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
            // If courier is not an existing user
            else{
                next(createError(401, "User credential mismatched !" ));
            }
        });
};

// Update courier's details
exports.updateCourier = (req, res, next) => {

    // Retrieving courier id from userData
    const id = req.userData.id;

    // Retrieve update option from request body
    var updateOps = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        courierImage: req.file.path,
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

    // Update courier's details in database
    Courier.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If courier's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "User's detail updated"
                });
            }
            // If invalid courier's id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If courier's updation failed.
        .catch(error => {
            error.message = "User's detail updation failed !";
            next(error);
        });
};

// Delete courier's records
exports.removeCourier = (req, res, next) => {

    // Getting courier's id from request
    const id = req.params.courierId;

    // Deleting courier's account from database
    Courier.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  courier's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Courier's record deleted."
                });
            }
            // If invalid courier id
            else {
                next(createError(404, "Invalid courier Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "Courier's record deletion failed !";
            next(error);
        })
};