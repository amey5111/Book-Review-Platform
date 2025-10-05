const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
const authHeader = req.headers.authorization || req.headers.Authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
return res.status(401).json({ message: 'Unauthorized: No token provided' });
}


const token = authHeader.split(' ')[1];
try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// attach minimal user info to request
req.user = { id: decoded.id, email: decoded.email };
next();
} catch (err) {
return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
}
};