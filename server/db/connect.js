import { MongoClient } from 'mongodb';
import 'dotenv/config';

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

let db;

export const connectDB = async () => {
    if (db) return db;

    try {
        await client.connect();
        db = client.db();
        console.log("Database connected successfully!");
        return db;
    } catch (err) {
        console.error("Database connection error:", err);
        throw err;
    }
};

export default client;
