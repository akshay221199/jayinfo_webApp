import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const Mongo_URI = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

const connectToMongo = async () => {
    try {
        if (!Mongo_URI) {
            throw new Error('Mongo URL is not found, please check the connection.');
        }

        // Connect to MongoDB with the specified URI and options
        await mongoose.connect(Mongo_URI, {
            dbName: DB_NAME,  // Specify the database name if it's not in the URI
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 50000,
        });

        // Log the success message
        console.log(`Connected to MongoDB Cluster: ${mongoose.connection.name || DB_NAME}`);

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
    }
};

export default connectToMongo;
