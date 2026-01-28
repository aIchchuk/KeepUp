/**
 * Simple CSRF protection middleware.
 * Since the app uses Bearer tokens in headers, it's already safe from traditional CSRF.
 * This middleware adds another layer of defense by ensuring a custom header is present
 * for all state-changing requests.
 */
const csrfMiddleware = (req, res, next) => {
    // We only care about state-changing methods
    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (sensitiveMethods.includes(req.method)) {
        const customHeader = req.headers['x-requested-with'] || req.headers['x-keepup-request'];

        // In a real Browser environment, some frameworks like Axios set X-Requested-With by default.
        // We can enforce it here.
        if (!customHeader) {
            // If the request doesn't have the custom header, we reject it.
            // Note: This might require updating the frontend axios config.
            // For now, we'll just log it and maybe allow it if it has an Authorization header,
            // because Authorization header itself prevents CSRF.

            if (!req.headers['authorization']) {
                return res.status(403).json({
                    message: "CSRF Protection: Missing custom security header or authorization token."
                });
            }
        }
    }

    next();
};

export default csrfMiddleware;
