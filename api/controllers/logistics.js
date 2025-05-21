// Importing all required modules
const bcrypt = require('bcryptjs');
// const mongoose = require('mongoose'); // Removed as per ESLint no-unused-vars
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const utils = require('../middlewares/utils');
const Logistic = require('../models/logistic');
const wallet = require('../sdk/gateway/wallet');
const contract = require('../sdk/gateway/contract');

// Retrieving logistic's details by logisticId
exports.getLogisticById = async function (req, res, next) {
    // Getting logistic's id from userData
    const id = req.userData.id;

    try {
        // Finding logistic's details using logistic id.
        const logistic = await Logistic.findById(id, {
            __v: 0,
            password: 0,
        }).exec();
        // if logistic found, return success response
        if (logistic) {
            res.status(200).json({
                status: 200,
                message: 'Logistic account details',
                logistic: logistic,
            });
        }
        // If logistic doesn't found, return not found response
        else {
            next(createError(404, 'Logistic details not found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Retrieving all logistic's details form database
exports.getAllLogistics = async function (req, res, next) {
    var query = {};

    if (req.originalUrl.split('/')[2] === 'by-status') {
        // Query for confirmed/unconfirmed logistics
        query = { statusConfirmed: req.params.statusConfirmed };
    } else {
        // Query for all logistics
        query = {};
    }

    try {
        // Finding all logistics details
        const result = await Logistic.paginate(query, {
            page: req.params.offSet || 1,
            limit: 20,
        });
        // If logistics found, return user details
        if (result.totalDocs > 0) {
            // Note: mongoose-paginate-v2 uses totalDocs
            const response = {
                status: 200,
                message: 'A list of logistic details',
                total: result.totalDocs,
                offset: parseInt(result.page, 10),
                pages: result.totalPages,
                logistics: result.docs,
            };
            res.status(200).json(response);
        }
        // If logistic doesn't found, return empty response
        else {
            next(createError(404, 'No logistics found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Creating new logistic/ processing signup
exports.logisticSignUp = async function (req, res, next) {
    // Creating logistic schema object and binding data to it
    const logistic = new Logistic(utils.createOps(req));

    try {
        // Creaing logistic account in couchdb
        await contract.invoke({
            org: 'delivery',
            user: 'admin',
            method: 'CreateAccount',
            args: [logistic._id.toString(), 'delivery'],
        });

        // Save logistic details in database
        await logistic.save();

        // If logistic account created, return success message
        await res.status(201).json({
            status: 201,
            message: 'User Created Successfully.',
        });
    } catch (error) {
        if (error._message) {
            // If validation failed, error.message should already be set by Mongoose.
            // The line `error.message = error.message;` was a no-op and caused `no-self-assign`.
        } else {
            // If not a Mongoose validation error (no _message), set a generic one.
            error.message = 'User creation failed !';
        }
        next(error);
    }
};

// Performing login process
exports.logisticLogin = async function (req, res, next) {
    try {
        // Checking logistic is valid or not
        const logistic = await Logistic.findOne({
            email: req.body.email,
        }).exec();

        // If logistic is an existing user then authenticate password
        if (logistic) {
            const passwordMatch = await bcrypt.compare(
                req.body.password,
                logistic.password
            );
            if (passwordMatch) {
                // Creating jwt token
                const token = jwt.sign(
                    {
                        id: logistic._id,
                        role: 'logistic',
                        email: logistic.email,
                        statusConfirmed: logistic.statusConfirmed,
                    },
                    process.env.JWT_SECRET_KEY,
                    {
                        expiresIn: '1h',
                    }
                );
                res.status(200).json({
                    status: 200,
                    message: 'Authentication sucesss !',
                    token: token,
                });
            } else {
                next(createError(401, 'User credential mismatched !'));
            }
        }
        // If logistic is not an existing user
        else {
            next(createError(401, 'User credential mismatched !'));
        }
    } catch (error) {
        next(error);
    }
};

// Update logistic's details
exports.updateLogistic = async function (req, res, next) {
    try {
        // Retrieve update option from request body
        var updateOps = await utils.updateUserOps(req);

        // Update logistic's details in database
        // Using updateOne instead of deprecated update
        const result = await Logistic.updateOne(
            { _id: req.userData.id },
            { $set: updateOps }
        ).exec();

        // If logistic's details updated successfully, return success response
        // Check modifiedCount for Mongoose v6+ or nModified for older versions
        if (result.modifiedCount > 0 || result.nModified > 0) {
            await res.status(200).json({
                status: 200,
                message: "User's detail updated.",
            });
        } else {
            // If invalid logistic's id
            next(createError(404, 'Invalid user Id !'));
        }
    } catch (error) {
        // If logistic's updation failed.
        error.message = "User's detail updation failed !";
        next(error);
    }
};

// Delete logistic's records
exports.removeLogistic = async function (req, res, next) {
    // Getting logistic's id from request
    const id = req.params.logisticId;

    try {
        // Deleting logistic's account from database
        // Using deleteOne instead of deprecated remove
        const result = await Logistic.deleteOne({ _id: id }).exec();

        // If  logistic's deleted successfully, return success response
        // Check deletedCount for Mongoose v6+
        if (result.deletedCount > 0) {
            // Delete logistic from couchdb
            await contract.invoke({
                org: 'delivery',
                user: 'admin',
                method: 'DeleteAccount',
                args: [id],
            });

            // Remove Identity from wallet
            await wallet.removeIdentity('admin', 'delivery');

            await res.status(200).json({
                status: 200,
                message: "Logistic's record deleted.",
            });
        } else {
            // If invalid logistic id
            next(createError(404, 'Invalid logistic Id !'));
        }
    } catch (error) {
        // If any error occurs, return error response
        error.message = "Logistic's record deletion failed !";
        next(error);
    }
};
