const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Static method to initialize default admin
adminSchema.statics.initializeDefaultAdmin = async function() {
    try {
        const adminCount = await this.countDocuments();
        if (adminCount === 0) {
            await this.create({
                username: 'admin',
                password: 'admin123'
            });
            console.log('Default admin created successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error initializing default admin:', error);
        throw error;
    }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
