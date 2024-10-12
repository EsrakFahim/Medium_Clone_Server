import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Global CORS configuration
app.use(
      cors({
            origin: ["https://medium-clone-two-chi.vercel.app"], // Allowed origin
            credentials: true, // Allow cookies and credentials
            methods: "GET,POST,PUT,DELETE,OPTIONS", // Allowed HTTP methods
            allowedHeaders: "Content-Type, Authorization", // Required headers
      })
);

app.use(cookieParser()); // Enable cookie parsing
app.use(express.json({ limit: "50mb" })); // JSON body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // URL-encoded data support

import imageRoute from "../src/routes/image.route.js";
import blogRoute from "../src/routes/blog.route.js";

app.use("/api/v1/image", imageRoute);
app.use("/api/v1/blog", blogRoute);

// Handle preflight requests
app.options("*", cors());

export { app };
