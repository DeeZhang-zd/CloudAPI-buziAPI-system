const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'zhangd5';

function authorize(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.user = user;
        next();
    });
}

function authorizeUser(req, res, next) {
    if (req.user.admin || req.user.id == req.params.userId) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }
}

function authorizeAdmin(req, res, next) {
    if (req.user.admin) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
}

module.exports = { authorize, authorizeUser, authorizeAdmin };
