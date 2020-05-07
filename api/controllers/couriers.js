// Importing all required modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createError = require("http-errors");
const wallet = require('../sdk/gateway/wallet');
const utils = require("../middlewares/utils");

const Courier = require("../models/courier");


// Retrieving courier's details by courierId
exports.getCourierById =  function (req, res, next) {

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
exports.getAllCouriers =  function (req, res, next) {

    // Building query
    let query = { logistic: req.userData.id };

    // Finding all logistics details
    Courier.paginate(query, { page: req.params.offSet || 1, limit: 20 })
        .then(result => {
            // If couriers found, return courier details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A list of courier details",
                    total: result.total,
                    offset: parseInt(result.page),
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
exports.courierSignUp = async function (req, res, next) {

    try {
        // Creating courier schema object and binding data to it
        const  courier = new Courier(utils.createOps(req));

        // Adding logisticId for courier registration
        courier.logistic = req.userData.id;

        // Register, enroll and import the courier identity in wallet
        await wallet.importIdentity({
            id: courier._id.toString(),
            org: 'delivery',
            msp: 'deliveryMSP',
            role: '',
            affiliation: ''
        });

        // Saving courier details in db
        await courier.save()

        // If courier account created, return success message
        await res.status(201).json({
            status: 201,
            message: "Courier account Created"
        });

    } catch (error) {
        if (error._message) {
            // If validation faied
            error.message = error.message;
        } else {
            // If courier account creation failed
            error.message = "Courier account creation failed !";
        }
        next(error);
    }
};

// Performing login process
exports.courierLogin = function (req, res, next) {

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
exports.updateCourier = async  function (req, res, next) {

    try {
        // Retrieve update option from request body
        const updateOps = await utils.updateOps(req);

        // Update courier's details in database
        var result = await Courier.update({ _id: req.userData.id }, { $set: updateOps });

        // If courier's details updated successfully, return success response
        if (result.nModified > 0) {
            res.status(200).json({
                status: 200,
                message: "User's detail updated"
            });
        } else {
            // If invalid courier's id
            next(createError(404, "Invalid user Id !"));
        }
    } catch (error) {
        // If courier's updation failed.
        error.message = "User's detail updation failed !";
        next(error);
    }
};

// Delete courier's records
exports.removeCourier = async function (req, res, next) {

    // Getting courier's id from request
    const id = req.params.courierId;

    try {
        // Deleting courier's account from database
        let result = await Courier.remove({ "_id": id });

        // If  courier's deleted successfully, return success response
        if (result.deletedCount > 0) {

            // Remove courier's wallet
            await wallet.removeIdentity(id, 'delivery');

            // Return success response
            await res.status(200).json({
                status: 200,
                message: "Courier's record deleted."
            });

        } else {
            // If invalid courier id
            next(createError(404, "Invalid courier Id !"));
        }
    } catch (error) {
        // If any error occurs, return error response
        error.message = "Courier's record deletion failed !";
        next(error);
    }
};