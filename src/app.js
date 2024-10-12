import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middleware setup
app.use(
      cors({
            origin: 'https://medium-clone-two-chi.vercel.app/', // CORS configuration for the specified origin
            credentials: true, // Allow cookies and credentials
            methods: "GET,POST,PUT,DELETE,OPTIONS", // Allowed HTTP methods
            allowedHeaders: "Content-Type, Authorization", // Allowed headers
      })
);
app.use(cookieParser()); // Enable cookie parsing
app.use(express.json({ limit: "50mb" })); // Enable JSON parsing with a size limit
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Support for URL-encoded data
app.use(express.static("public")); // Serve static files from 'public' directory

import imageRoute from "../src/routes/image.route.js";
import blogRoute from "../src/routes/blog.route.js";

app.use("/api/v1/image", imageRoute);

app.use("/api/v1/blog", blogRoute);

export { app };
