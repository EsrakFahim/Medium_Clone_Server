// DB/index.js
import mongoose from "mongoose";
import { DB_name } from "../constance.js";

const connectDB = async () => {
      try {
            // Ensure URI and database name are correctly formatted
            const DB_URI = `${process.env.DB_CONNECTION_URI}/${DB_name}`;

            console.log("Attempting to connect to DB with URI:", DB_URI);

            // Connect to MongoDB with recommended options
            const DB = await mongoose.connect(DB_URI, {
                  useNewUrlParser: true,
                  useUnifiedTopology: true,
            });

            console.log(
                  `MongoDB connected: HOST: ${DB.connection.host}, Database: ${DB.connection.name}`
            );
      } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            process.exit(1); // Exit if connection fails
      }
};

export { connectDB };
