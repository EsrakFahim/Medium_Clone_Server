// index.js
import dotenv from "dotenv";
import { connectDB } from "./DB/index.js";
import { app } from "./app.js";

// Load environment variables (No path needed for Vercel)
dotenv.config();

const PORT = process.env.PORT || 5050;

connectDB()
      .then(() => {
            console.log("Connected to MongoDB!");

            // Define routes
            app.get("/", (req, res) => {
                  res.send("Welcome to the API");
            });

            // Start the server
            app.listen(PORT, () => {
                  console.log(`Server running on port ${PORT}`);
            });

            // Handle server errors
            app.on("error", (err) => {
                  console.error(`Server Error: ${err.message}`);
            });
      })
      .catch((error) => {
            console.error(`DB Connection Error: ${error.message}`);
            process.exit(1); // Exit if DB connection fails
      });
