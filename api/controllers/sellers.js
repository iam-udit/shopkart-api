// Importing all required modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createError = require("http-errors");
const userExists = require('../middlewares/user-exists');

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
                res.status(200).json(seller);
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

    if(req.params.statusConfirmed != undefined){
        // Query for confirmed/unconfirmed sellers
        query = { statusConfirmed: req.params.statusConfirmed };
    } else {
        // Query for all sellers
        query = {};
    }

    // Finding sellers details
    Seller.find(query, { __v : 0 })
        .exec()
        .then(sellers => {
            // If sellers found, return user details
            if (sellers.length > 0) {
                const response = {
                    count: sellers.length,
                    sellers: sellers
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

    // Creating seller schema object and binding data to it
    const  seller = new Seller({
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.npassword
    });

    seller.save()
        // If seller account created, return success message
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
                                email : seller.email,
                                statusConfirmed: seller.statusConfirmed
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
        address: req.body.address,
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
            error.message = "User's detail updation failed !";
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
            error.message = "Seller's record deletion failed !";
            next(error);
        })
};