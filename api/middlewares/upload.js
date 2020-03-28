// Importing all required packages
const multer = require("multer");
const mkdirp = require("mkdirp");
const createError = require("http-errors");
const Product = require("../models/product");


// Providing destination, filename to multer
const storage = multer.diskStorage({

    // Providing destination path
    destination : (req, file, cb) => {
        // Creating target directories
        const dir = "uploads"+ req.originalUrl + req.body.type + "/" + req.body.title;
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
        if(req.originalUrl == "/products/"){
            // Ignore if product is already exist
            Product.findOne({ title : req.body.title })
                .exec()
                .then(product => {
                    // If product already exist then ignore
                    if(product){
                        cb(null, false);
                    }
                    // If product not exist then proceed to store
                    else {
                        cb(null, true);
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
