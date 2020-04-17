// Importing all required packages
const fs = require("fs");
const multer = require("multer");
const mkdirp = require("mkdirp");
const createError = require("http-errors");
const Product = require("../models/product");


// Providing destination, filename to multer
const storage = multer.diskStorage({

    // Providing destination path
    destination : (req, file, cb) => {
        // Creating target directories
        const dir = "uploads"+ "/products/" + req.body.type + "/" + req.body.title;
        mkdirp.sync(dir);
        cb(null,dir);
    },

    // Providing file name
    filename : (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname );
    }
});

// Preventing unwanted files, accepting only jpeg,png,jpg and gif
const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif"
    ){
        // Checking product image of profile image
        if(req.originalUrl.split("/")[1] == "products"){
            // Making query
            var query = {};
            if(req.method == "PATCH"){
                query = { _id : req.params.productId };
            } else if(req.method == "POST"){
                query = { title: req.body.title };
            }

            // Ignore if product is already exist
            Product.findOne(query)
                .exec()
                .then(product => {
                        // If product already exist then ignore
                        if(product){
                            // If product is avalable and method is update
                            if(req.method == "PATCH"){
                                // Delete all old images, then allow to upload
                                product.productImages.forEach( image => {

                                    if(fs.existsSync(image)){
                                        fs.unlinkSync(image);
                                    }
                                });
                               /* // Delete the destination directory
                                let subDir = product.productImages[0].split("/");
                                fs.rmdir(subDir[0] + "/" + subDir[1] + "/" + subDir[2] + "/" + subDir[3], function(error){});
*/
                                cb(null, true);
                            }else{
                                // If method is post, dont upload file
                                cb(null, false);
                            }
                        }
                        // If product not exist then proceed to store
                        else {
                            if(req.method == "PATCH"){
                                cb(null, false);
                            } else {
                                cb(null, true);
                            }
                        }
                    }
                );
        } else{
            // Allow to store user profile image
            cb(null, true);
        }
    }else{
        // If condition does not satisfied, return error message
        cb( createError(500,"Only jpeg, jpg, png, gig files are allowed"), false);
    }
}

// Storing fie using multer
module.exports = multer({
    storage : storage,

    limits : {
        fileSize : 512 * 1024
    },

    fileFilter : fileFilter
});
