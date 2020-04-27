// Importing all required modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createError = require("http-errors");
const wallet = require('../sdk/gateway/wallet');

const Seller = require("../models/seller");

// Retrieving seller's details by sellerId
exports.getSellerById =  (req, res, next) => {

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
                    message: "Seller details of the given Id: " + id,
                    seller: seller
                });
            }
            // If seller doesn't found, return not found response
            else {
                next(createError(404, "No valid user found for provided ID"));
            }

        })
        // If any error occures, return error message
        .catch(error => {
            next(error);

        });
};

// Retrieving all seller's details form database
exports.getAllSellers =  (req, res, next) => {

    var query = {};

    if(req.originalUrl.split('/')[2] == 'by-status'){
        // Query for confirmed/unconfirmed sellers
        query = { statusConfirmed: req.params.statusConfirmed };
    } else {
        // Query for all sellers
        query = {};
    }

    // Finding sellers details
    Seller.paginate(query, { offset: parseInt(req.params.offSet) || 0, limit: 10 })
        .then(result => {
            // If sellers found, return user details
            if (result.total > 0) {
                const response = {
                    status: 200,
                    message: "A List of seller details",
                    total: result.total,
                    offset: result.offset,
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
exports.sellerSignUp = (req, res, next)=>{

    // Creating id for seller registration
    let id = new mongoose.Types.ObjectId();
    // Register, enroll and import the seller identity in wallet
    wallet.importIdentity({
        id: id.toString(),
        org: 'ecom',
        msp: 'ecomMSP',
        role: 'seller',
        affiliation: 'ecom.seller'
    },(error) => {
        // If any error occur then return error response
        next(error);
    });

    // Creating seller schema object and binding data to it
    const  seller = new Seller({
        _id: id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });

    seller.save()
        // If seller account created, return success message
        .then(result => {
            res.status(201).json({
                status: 201,
                message: "User Created Successfully."
            });
        })
        // If any error occur return error message
        .catch(error=>{
            if (error._message) {
                // If validation faied
                error.message = error.message;
            } else {
                // If seller account creation failed
                error.message = "User creation failed !";
            }
            next(error);
        });
};

// Performing login process
exports.sellerLogin = (req, res, next)=>{

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
exports.updateSeller = (req, res, next) => {

    // Retrieving seller id from userData
    const id = req.userData.id;

    // Retrieve update option from request body
    var updateOps = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        sellerImage: req.file.path,
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

    // Update seller's details in database
    Seller.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {

            // If seller's details updated successfully, return success response
            if (result.nModified > 0) {
                res.status(200).json({
                    status: 200,
                    message: "User's detail updated."
                });
            }
            // If invalid seller's id
            else {
                next(createError(404, "Invalid user Id !"));
            }

        })
        // If seller's updation failed.
        .catch(error => {
            error.message = "User details updation failed !";
            next(error);
        });
};

// Delete seller's records
exports.removeSeller = (req, res, next) => {

    // Getting seller's id from request
    const id = req.params.sellerId;

    // Deleting seller's account from database
    Seller.remove({ "_id": id })
        .exec()
        .then(result => {
            // If  seller's deleted successfully, return success response
            if (result.deletedCount > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Seller's record deleted."
                });
            }
            // If invalid seller id
            else {
                next(createError(404, "Invalid seller Id !"));
            }

        })
        // If any error occurs, return error response
        .catch(error => {
            error.message = "Seller details deletion failed !";
            next(error);
        })
};