// src/config/db.js
const mongoose = require('mongoose');


const connectDB = async () => {
try {
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI missing in environment');
await mongoose.connect(uri, {
useNewUrlParser: true,
useUnifiedTopology: true,
});
console.log('MongoDB connected');
} catch (err) {
console.error('MongoDB connection error:', err);
process.exit(1);
}
};


module.exports = connectDB;