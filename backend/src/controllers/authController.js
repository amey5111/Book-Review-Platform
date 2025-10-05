const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
const payload = { id: user._id, email: user.email };
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
return jwt.sign(payload, secret, { expiresIn });
};


exports.signup = async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });


// check existing
const existing = await User.findOne({ email });
if (existing) return res.status(409).json({ message: 'Email already registered' });


const user = await User.create({ name, email, password });


const token = generateToken(user);
return res.status(201).json({ user: user.toJSON(), token });
} catch (err) {
// handle duplicate key (race condition)
if (err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
console.error('Signup error', err);
return res.status(500).json({ message: 'Internal server error' });
}
};


exports.login = async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Email and password required' });


const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });


const isMatch = await user.comparePassword(password);
if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });


const token = generateToken(user);
return res.json({ user: user.toJSON(), token });
} catch (err) {
console.error('Login error', err);
return res.status(500).json({ message: 'Internal server error' });
}
};


// GET /api/auth/me — protected
exports.getMe = async (req, res) => {
try {
// `req.user` is set in auth middleware (id + email)
const user = await User.findById(req.user.id).select('-password');
if (!user) return res.status(404).json({ message: 'User not found' });
return res.json({ user });
} catch (err) {
console.error('getMe error', err);
return res.status(500).json({ message: 'Internal server error' });
}
};