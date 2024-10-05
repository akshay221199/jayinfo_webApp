import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const adminMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];  // Extract the token from the header
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Ensure JWT secret is available
        if (!JWT_SECRET) {
            throw new Error('JWT secret is not defined');
        }

        // Verify the token
        const data = jwt.verify(token, JWT_SECRET);

        // Check if the admin flag exists in the token data
        if (!data.admin) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        // Attach the admin data to the request object as `req.admin`
        req.admin = data.admin;  // Make sure you use `req.admin` instead of `req.user`
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error.message || error);
        res.status(401).json({ error: "Invalid token." });
    }
};

export default adminMiddleware;
