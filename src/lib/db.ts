import mongoose from "mongoose";

type connectionObject = {
    isConnected?: number;
}

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("MongoDB is already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI as string || "");
        connection.isConnected = db.connections[0].readyState;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default dbConnect;