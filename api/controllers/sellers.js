// Importing all required modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createError = require("http-errors");
const wallet = require('../sdk/gateway/wallet');
const utils = require('../middlewares/utils');
const contract = require('../sdk/gateway/contract');

const Seller = require("../models/seller");

// Retrieving seller's details by sellerId
exports.getSellerById =  function (req, res, next) {

    // Getting seller's id from userData
    const id = req.userData.id;

    // Finding seller's details using seller id.
    Seller.findById(id, { __v: 0, password: 0 })
        .exec()
        .then(seller => {
            // if seller found, return success response
            if (seller) {
                res.status(200).json({
                    status: 200,
                    message: "Seller account details",
                    seller: seller
                });
            }
            // If seller doesn't found, return not found response
            else {
                next(createError(404, "Seller details not found !"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all seller's details form database
exports.getAllSellers = function (req, res, next) {

    var query = {};

    if(req.originalUrl.split('/')[2] == 'by-status'){
        // Query for confirmed/unconfirmed sellers
        query = { statusConfirmed: req.params.statusConfirmed };
    } else {
        // Query for all sellers
        query = {};
    }

    // Finding sellers details
    Seller.paginate(query, { offset: ( parseInt(req.params.offSet) - 1 || 0 ) * 10, limit: 10 })
        .then(result => {
            // If sellers found, return user details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A List of seller details",
                    total: result.total,
                    offset: (result.offset / 10) + 1,
                    pages: Math.ceil( result.total / result.limit ),
                    sellers: result.docs
                }
                res.status(200).json(response);
            }
            // If seller doesn't found, return empty response
            else {
                next(createError(404, "No sellers found !"));
            }
        })
        // If any error occures, return error message
        .catch(error => {
            next(error);
        })
};

// Creating new seller/ processing signup
exports.sellerSignUp = async function (req, res, next) {

    try {

        // Creating seller schema object and binding data to it
        const  seller = new Seller(utils.createOps(req));

        // Saving sellers data in mongodb
        await seller.save();

        // If seller account created, return success message
        await res.status(201).json({
            status: 201,
            message: "User Created Successfully."
        });

    } catch (error) {
        if (error._message) {
            // If validation faied
            error.message = error.message;
        } else {
            // If seller account creation failed
            error.message = "User creation failed !";
        }
        next(error);
    }
};

// Creating seller wallet and register and enroll with ca-server
exports.createWallet = async function (req, res, next) {

    try {
        // Getting sellerId from request
        let sellerId = req.params.id;

        // Checking seller is exists user or not
        let userExist = await Seller.findById(sellerId);

        if(userExist) {

            // If seller is registered & enrolled successfully then create account in chain code
            await contract.invoke({
                org: "ecom",
                user: 'admin',
                method: "CreateAccount",
                args: [sellerId, 'seller']
            });

            // Register, enroll and import the seller identity in wallet
            await wallet.importIdentity({
                id: sellerId,
                org: 'ecom',
                msp: 'ecomMSP',
                role: 'seller',
                affiliation: 'ecom.seller'
            });

        } else {
            // If user not exist, return error response
            next(createError(404, "Invalid user Id !"));
        }

    } catch (error) {
        // If any error occur, then return error response
        next(createError(500, "Verification failed !"));
    }
}

// Performing login process
exports.sellerLogin = function (req, res, next) {

    // Checking seller is valid or not
    Seller.findOne({ email : req.body.email })
        .exec()
        .then(seller => {
            // If seller is an existing user then authenticate password
            if(seller){
                bcrypt.compare(req.body.password, seller.password, (error, result) => {
                    if(result){
                        // Creating jwt token
                        const token = jwt.sign(
                            {
                                id: seller._id,
                                role: 'seller',
                                email : seller.email,
                                statusConfirmed: seller.statusConfirmed
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
            // If seller is not an existing user
            else{
                next(createError(401, "User credential mismatched !" ));
            }
        });
};

// Update seller's details
exports.updateSeller = async function (req, res, next) {

    try {
        // Retrieve update option from request body
        var updateOps = await utils.updateOps(req);

        // Update seller's details in database
        var result = await Seller.update({ _id: req.userData.id }, { $set: updateOps });

        // If seller's details updated successfully, return success response
        if (result.nModified > 0) {
            res.status(200).json({
                status: 200,
                message: "User's detail updated."
            });
        } else {
            // If invalid seller's id
            next(createError(404, "Invalid user Id !"));
        }
    } catch (error) {
        // If seller's updation failed.
        error.message = "User details updation failed !";
        next(error);
    }
};

// Delete seller's records
exports.removeSeller = async function (req, res, next) {

    // Getting seller's id from request
    let id = req.params.sellerId;
    console.log(id)

    try {

        // Deleting seller's account from mongodb database
        let result = await Seller.deleteOne({ "_id": id });

        // If  seller's deleted successfully, return success response
        if (result.deletedCount > 0) {

            // Delete seller from chain code
            await contract.invoke( {
                org: "ecom",
                user: 'admin',
                method: "DeleteAccount",
                args: [id]
            });

            // Remove seller's wallet
            await wallet.removeIdentity(id, 'ecom').catch(e=>{});

            // Return success response
            await res.status(200).json({
                status: 200,
                message: "Seller's record deleted."
            });

        } else {
            // If invalid seller id
            next(createError(404, "Invalid seller Id !"));
        }

    } catch (error) {
        // If any error occurs, return error response
        error.message = "Seller details deletion failed !";
        next(error);
    }
};