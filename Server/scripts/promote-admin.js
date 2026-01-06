import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${email} to admin!`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote-admin.js <email>');
    process.exit(1);
}

promoteToAdmin(email);
