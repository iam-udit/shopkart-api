
const expressValidator = require("express-validator");

// Sanitize input fields
module.exports = (req, res, next) => {

    // Sanitizing body data
    if(req.body){

        for ( field in req.body){
            expressValidator.check(req.body[field]).trim().escape();
        }
    }
    // Sanitizing params data
    const param = req.params.productId || req.params.productType;
    if(param){
        expressValidator.check(param).trim().escape();
    }
    next();
}
