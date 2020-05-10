// Importing all required packages
const fs = require("fs");
const path = require('path');
const multer = require("multer");
const mkdirp = require("mkdirp");
const mongoose = require("mongoose");
const createError = require("http-errors");

const Product = require("../models/product");

var temp = '';
var dir = '';

// Create target directories
function createDir(req, temp) {

    let targetDir = "";

    if ( temp == 'admin' ){
        // Destination for admin
        targetDir = path.join(dir, 'admin');
    } else if ( temp == 'products'){
        // Destination for products
        targetDir = path.join(dir, temp, req.body.type.toLowerCase(), req.body.title +'-'+ req.userData.id);
    } else if ( temp == 'users' || temp == 'sellers' || temp == 'logistics'  || temp == 'couriers' ) {
        // Destination for users, sellers, logistics
        targetDir = path.join(dir, temp, req.userData.id);
    }

    return targetDir;
}

// Remove target directories
var removeDir = function (dir) {
    // Checking if the dir is exists or not
    if(fs.existsSync(dir)){
        // Reading all the sub files
        let files = fs.readdirSync(dir);
        if (files.length > 0){
            // If the files are present then unlink
            files.forEach(fileName=>{
                fs.unlinkSync( dir + '/' + fileName );
            })
        }
        fs.rmdirSync(dir);
    }
}

// Validating product exists or not
async function isProductExists(req, cb) {

    var query = {};

    try {
        if ( req.method == 'POST' ){
            // Query for searching product for post method
            query = {
                title : req.body.title,
                type: req.body.type,
                seller: req.userData.id
            };
        } else {
            // Query for searching product for put method
            query = {
                title : req.body.title,
                seller: req.userData.id,
                _id: { $ne : req.params.productId }
            };
        }

        // Checking if the product is exist or not
        let productExist = await Product.findOne(query);

        if (productExist) {
            // If product is exists, return error message - can't create / cant't update
            cb(createError(409, "Duplicate product entry !"), null);
        } else {
            // If product not exist, then allow for create / update
            return true;
        }

    } catch (error) {
        // If any error occur
        cb(createError(500, error.message), null);
    }
}

// Providing destination, filename to multer
const storage = multer.diskStorage({

    // Providing destination path
    destination : async (req, file, cb) => {

        // Creating target directories
        dir = 'public/uploads/';

        // Getting the model
        temp = req.originalUrl.split('/')[1];

        if (temp == 'products' && await isProductExists(req, cb) && req.method == 'PUT') {

            // If product is exists and then allow to update
            let productDetails = await Product.findById(req.params.productId);

            if (
                (req.body.title != undefined && req.body.title != productDetails.title) ||
                (req.body.type != undefined && req.body.type.toLowerCase() != productDetails.type)
            ) {
                // If type or title updated then remove previous file/ images
                removeDir(path.join(dir, temp, productDetails.type, productDetails.title +'-'+ req.userData.id));
            }

            // If title and type is undefined
            req.body.title = req.body.title || productDetails.title;
            req.body.type = req.body.type || productDetails.type;
        }

        // Creating target directories
        dir = createDir(req, temp);

        // Delete if the dir is already exist
        if ( (temp == 'products' &&  req.files.length == 1) || temp != 'products') {
            removeDir(dir);
        }

        // Creating the new dir
        mkdirp.sync(dir);

        cb(null,dir);
    },

    // Providing file name
    filename : (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname );
    }
});

// Preventing unwanted files, accepting only jpeg,png,jpg and gif
const fileFilter = function (req, file, cb) {
    if(
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif"
    ){
        // If condition satisfied, allow to upload
        cb(null, true);
    }else{
        // If condition does not satisfied, return error message
        cb( createError(500,"Only jpeg, jpg, png, gig files are allowed"), false);
    }
}

// Storing fie using multer
module.exports = multer({
    storage : storage,
    limits : {
        fileSize : 1024 * 1024
    },
    fileFilter : fileFilter
});
