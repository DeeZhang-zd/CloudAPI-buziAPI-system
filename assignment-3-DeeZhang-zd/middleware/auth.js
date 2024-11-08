const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'zhangd5';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log('Failed to authenticate token', err);
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
