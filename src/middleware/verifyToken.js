const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        // Use token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if the token contains the userId (or any required payload data)
        if (!decoded.userId) {
            return res.status(401).send({ message: "Invalid token" });
        }

        // Attach decoded values to the request object
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();

    } catch (error) {
        console.error("Error verifying token:", error);

        // Check if the token is expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ message: "Token expired" });
        }

        // Handle other errors (invalid token, etc.)
        return res.status(401).send({ message: "Invalid token" });
    }
};

module.exports = verifyToken;
