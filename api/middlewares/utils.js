// Importing required modules
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const createError = require('http-errors');
const { createModel } = require('./password-ops');

// Check admin permission
exports.checkAdminPermission = function (req, res, next) {
    // If request not form admin
    if (req.userData.role != 'admin'){
        next(createError(401,"You are not an eligible user for this operation !"));
    } else {
        next();
    }
}

// Common createOps
exports.createOps = function (req) {

    // Creating signUp options
    let options = {
        _id : new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    }

    // Returning the options
    return options;
}

// Common updateOps
exports.updateOps = async function (req) {

    // Creating model class
    const Model = createModel(req);

    // Getting role for request
    let role = req.userData.role;

    // Getting old records
    const user = await Model.findById(req.userData.id);

    // Creating update options
    var updateOps = {
        firstName: req.body.firstName || user.firstName,
        lastName: req.body.lastName || user.lastName,
        mobileNumber: req.body.mobileNumber || user.mobileNumber,
        address: {
            city: req.body.city || user.address.city,
            state: req.body.state || user.address.state,
            country: req.body.country || user.address.country,
            zip: req.body.zip || user.address.zip,
            body: req.body.body || user.address.body
        },
        gender: req.body.gender || user.gender,
        age: req.body.age || user.age
    };

    // Retriveing image path
    if (req.file != undefined) {

        let imagePath = req.file.path.replace('public/uploads/', '');

        if( role == 'admin' || role == 'customer' ) {
            // If request from admin or user
            updateOps.userImage = imagePath;
        } else {
            // If request from sellers, logistics, couriers
            updateOps[ role + 'Image' ] =  imagePath;
        }
    }

    // Adding email and removing mobileNumber if request from user
    if ( role == 'customer' ){
        delete updateOps.mobileNumber;
        updateOps.email = req.body.email || user.email;
    }

    // Returning update options
    return updateOps;
}

// Create product response
exports.productResponse = function (req, product) {

    // Creating product response
    let response = {
        _id: product._id,
        seller: product.seller,
        title: product.title,
        type: product.type,
        colours: product.colours,
        sizes: product.sizes,
        quantity: product.quantity,
        price: product.price,
        productImages : product.productImages,
        description: product.description,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        request: {
        type: "GET",
            description: "GET_PRODUCT_DETAILS",
            url: req.protocol + '://' + req.get('host') + "/products/get/" + product._id
        }
    }

    // Returning response
    return response;
}

// Create order response
exports.orderResponse = function (req, order) {

    // Creating order response
    let response = {
        _id: order._id,
        user: order.user,
        seller: order.seller,
        logistic: order.logistic,
        courier: order.courier,
        product: order.product,
        colour: order.colour,
        size: order.size,
        quantity: order.quantity,
        orderStatus: order.orderStatus,
        shipmentCharges: order.shipmentCharges,
        totalBalance: order.totalBalance,
        deliveryAddress: order.deliveryAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        request: {
        type: "GET",
            description: "GET_ORDER_DETAILS",
            url: req.protocol + '://' + req.get('host') + "/orders/get/" + order._id
        }
    }

    // Returning response
    return response;
}
