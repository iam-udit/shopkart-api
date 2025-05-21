const sanitizeHtml = require('sanitize-html');

const sanitizeRequestDataRecursive = (data) => {
    if (typeof data === 'string') {
        return sanitizeHtml(data, {
            allowedTags: [], // No tags allowed, effectively strips all HTML
            allowedAttributes: {}, // No attributes allowed
        });
    }
    if (Array.isArray(data)) {
        return data.map(sanitizeRequestDataRecursive); // Ensure recursive call uses the correct function name
    }
    if (typeof data === 'object' && data !== null) {
        const sanitizedObject = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObject[key] = sanitizeRequestDataRecursive(data[key]);
            }
        }
        return sanitizedObject;
    }
    return data;
};

const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeRequestDataRecursive(req.body);
    }
    if (req.query) {
        req.query = sanitizeRequestDataRecursive(req.query);
    }
    if (req.params) {
        req.params = sanitizeRequestDataRecursive(req.params);
    }
    next();
};

module.exports = sanitizeMiddleware;
