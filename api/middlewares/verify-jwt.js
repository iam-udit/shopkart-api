const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = function (req, res, next) {

    // Authenticating jwt token
    try {
        req.userData = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        res.setHeader("Authorization-Status", true);
        next();
    }
    // If authentication failed
    catch (error) {
        res.setHeader("Authorization-Status", false);
        next(createError(401, "Authentication failed !"));
    }
};
