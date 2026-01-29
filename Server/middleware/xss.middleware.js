import xss from "xss";

/**
 * Middleware to sanitize user input to prevent XSS attacks.
 * It recursively sanitizes all strings in req.body, req.query, and req.params.
 */
const sanitize = (data) => {
    if (typeof data === "string") {
        return xss(data);
    }
    if (typeof data === "object" && data !== null) {
        for (let key in data) {
            data[key] = sanitize(data[key]);
        }
    }
    return data;
};

const xssMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        for (let key in req.query) {
            req.query[key] = sanitize(req.query[key]);
        }
    }
    if (req.params) {
        for (let key in req.params) {
            req.params[key] = sanitize(req.params[key]);
        }
    }
    next();
};

export default xssMiddleware;
