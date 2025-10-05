const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
password: { type: String, required: true},
}, { timestamps: true });


// Hash password before saving (only when modified)
userSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();
try {
const salt = await bcrypt.genSalt(10); // recommended 10
this.password = await bcrypt.hash(this.password, salt);
return next();
} catch (err) {
return next(err);
}
});


// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
return bcrypt.compare(candidatePassword, this.password);
};


// Remove password when converting to JSON
userSchema.methods.toJSON = function () {
const obj = this.toObject();
delete obj.password;
return obj;
};


module.exports = mongoose.model('User', userSchema);