import mongoose from "mongoose";
import env from "../environment.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.mongo_db);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Database Connection Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;