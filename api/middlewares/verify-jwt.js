const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = (req, res, next) => {

    // Authenticating jwt token
    try {
        req.userData = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        next();
    }
    // If authentication failed
    catch (error) {
        next(createError(401, "Authentication failed !"));
    }
};
