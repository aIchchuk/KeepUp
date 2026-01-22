import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from '../models/template.model.js';

dotenv.config();

const listTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const templates = await Template.find({});
        console.log('--- TEMPLATES FOUND ---');
        templates.forEach(t => {
            console.log(`ID: ${t._id}`);
            console.log(`Title: "${t.title}"`); // Quotes to check for whitespace
            console.log('-------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error listing templates:', error);
        process.exit(1);
    }
};

listTemplates();
