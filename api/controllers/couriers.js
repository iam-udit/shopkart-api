// Importing all required modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose'); // Removed as per ESLint no-unused-vars
const createError = require('http-errors');
const Courier = require('../models/courier');
const utils = require('../middlewares/utils');
const wallet = require('../sdk/gateway/wallet');

// Retrieving courier's details by courierId
exports.getCourierById = async function (req, res, next) {
    // Getting courier's id from userData
    const id = req.userData.id;

    try {
        // Finding courier's details using courier id.
        const courier = await Courier.findById(id, {
            __v: 0,
            password: 0,
        }).exec();

        // if courier found, return success response
        if (courier) {
            res.status(200).json({
                status: 200,
                message: 'Courier account details',
                courier: courier,
            });
        }
        // If courier doesn't found, return not found response
        else {
            next(createError(404, 'Courier details not found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Retrieving all courier's details by logistic Id
exports.getAllCouriers = async function (req, res, next) {
    // Building query
    let query = { logistic: req.userData.id };

    try {
        // Finding all logistics details
        const result = await Courier.paginate(query, {
            page: req.params.offSet || 1,
            limit: 20,
        });

        // If couriers found, return courier details
        if (result.totalDocs > 0) {
            // Note: mongoose-paginate-v2 uses totalDocs
            const response = {
                status: 200,
                message: 'A list of courier details',
                total: result.totalDocs,
                offset: parseInt(result.page, 10),
                pages: result.totalPages,
                couriers: result.docs,
            };
            res.status(200).json(response);
        }
        // If courier doesn't found, return empty response
        else {
            next(createError(404, 'No couriers found !'));
        }
    } catch (error) {
        // If any error occures, return error message
        next(error);
    }
};

// Creating new courier/ processing signup
exports.courierSignUp = async function (req, res, next) {
    try {
        // Creating courier schema object and binding data to it
        const courier = new Courier(utils.createOps(req));

        // Adding logisticId for courier registration
        courier.logistic = req.userData.id;

        // Register, enroll and import the courier identity in wallet
        await wallet.importIdentity({
            id: courier._id.toString(),
            org: 'delivery',
            msp: 'deliveryMSP',
            role: '',
            affiliation: '',
        });

        // Saving courier details in db
        await courier.save();

        // If courier account created, return success message
        await res.status(201).json({
            status: 201,
            message: 'Courier account Created',
        });
    } catch (error) {
        if (error._message) {
            // If validation failed, error.message should already be set by Mongoose.
            // The line `error.message = error.message;` was a no-op and caused `no-self-assign`.
            // No action needed here if we intend to use the existing Mongoose error message.
        } else {
            // If not a Mongoose validation error (no _message), set a generic one.
            error.message = 'Courier account creation failed !';
        }
        next(error);
    }
};

// Performing login process
exports.courierLogin = async function (req, res, next) {
    try {
        // Checking courier is valid or not
        const courier = await Courier.findOne({ email: req.body.email }).exec();

        // If courier is an existing user then authenticate password
        if (courier) {
            const passwordMatch = await bcrypt.compare(
                req.body.password,
                courier.password
            );
            if (passwordMatch) {
                // Creating jwt token
                const token = jwt.sign(
                    {
                        id: courier._id,
                        role: 'courier',
                        email: courier.email,
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
        // If courier is not an existing user
        else {
            next(createError(401, 'User credential mismatched !'));
        }
    } catch (error) {
        next(error);
    }
};

// Update courier's details
exports.updateCourier = async function (req, res, next) {
    try {
        // Retrieve update option from request body
        const updateOps = await utils.updateUserOps(req);

        // Update courier's details in database
        // Using updateOne instead of deprecated update
        const result = await Courier.updateOne(
            { _id: req.userData.id },
            { $set: updateOps }
        ).exec();

        // If courier's details updated successfully, return success response
        // Check modifiedCount for Mongoose v6+ or nModified for older versions
        if (result.modifiedCount > 0 || result.nModified > 0) {
            res.status(200).json({
                status: 200,
                message: "User's detail updated",
            });
        } else {
            // If invalid courier's id
            next(createError(404, 'Invalid user Id !'));
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
        // Using deleteOne instead of deprecated remove
        const result = await Courier.deleteOne({ _id: id }).exec();

        // If  courier's deleted successfully, return success response
        // Check deletedCount for Mongoose v6+
        if (result.deletedCount > 0) {
            // Remove courier's wallet
            await wallet.removeIdentity(id, 'delivery');

            // Return success response
            await res.status(200).json({
                status: 200,
                message: "Courier's record deleted.",
            });
        } else {
            // If invalid courier id
            next(createError(404, 'Invalid courier Id !'));
        }
    } catch (error) {
        // If any error occurs, return error response
        error.message = "Courier's record deletion failed !";
        next(error);
    }
};
