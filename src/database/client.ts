import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const options: mongoose.ConnectOptions = {};

mongoose.connection.on("connected", () => {
	console.log("Connected to MongoDB");
});

const clientPromise = mongoose.connect(uri, options);

export default clientPromise;
