// Importing all required packages
const fs = require("fs");
const path = require('path');
const multer = require("multer");
const mkdirp = require("mkdirp");
const createError = require("http-errors");

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
        targetDir = path.join(dir, temp, req.body.type, req.body.title +'-'+ req.userData.id);
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

// Providing destination, filename to multer
const storage = multer.diskStorage({

    // Providing destination path
    destination : (req, file, cb) => {

        // Creating target directories
        dir = 'public/uploads/';

        // Getting the model
        temp = req.originalUrl.split('/')[1];
        console.log(req.body+"----------------------------")
        // Creating target directories
        dir = createDir(req, temp);

        // Delete if the dir is already exist
        if ( temp == 'products' &&  req.files.length == 1 || temp != 'products') {
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

        if(
            temp == 'products' &&
            (
                fs.existsSync(dir) && req.method == 'POST' ||
                !fs.existsSync(dir) && req.method == 'PATCH'
            )
        ) {
            // If product already exist in post method then ignore or
            // If the product is not exist in patch then ignore
            cb(null, false);
        } else {
            // otherwise allow to upload
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
        fileSize : 1024 * 1024
    },
    fileFilter : fileFilter
});

module.exports.removeDir = removeDir;