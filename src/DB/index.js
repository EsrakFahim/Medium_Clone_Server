import mongoose from "mongoose";
import { DB_name } from "../constance.js";

const connectDB = async () => {
      try {
            const DB = await mongoose.connect(
                  `${process.env.DB_CONNECTION_URI}/${DB_name}`
            );
            console.log(
                  `MongoDB connected: HOST: ${DB.connection.host} Database: ${DB.connection.name}`
            );
      } catch (error) {
            console.error(error);
            process.exit(1);
      }
};

export { connectDB };
