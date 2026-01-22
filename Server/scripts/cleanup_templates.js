import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from '../models/template.model.js';

dotenv.config();

const cleanTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const templatesToDelete = [
            "6973b0ec6c1a8e78aeb86318",
            "6973b0ec6c1a8e78aeb86319",
            "6973b0ec6c1a8e78aeb8631a"
        ];

        const result = await Template.deleteMany({
            _id: { $in: templatesToDelete }
        });

        console.log(`Deleted ${result.deletedCount} templates.`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning templates:', error);
        process.exit(1);
    }
};

cleanTemplates();
