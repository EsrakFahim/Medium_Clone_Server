import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // For environment variables
import cookieParser from "cookie-parser";

dotenv.config(); // Load environment variables

const app = express();

const allowedOrigins = [
      process.env.SITE_ORIGIN_PROD, // Production frontend
      process.env.SITE_ORIGIN_LOCAL, // Local development frontend
];

// CORS Middleware (with credentials)
app.use(
      cors({
            origin: (origin, callback) => {
                  if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true); // Allow request
                  } else {
                        callback(new Error("Not allowed by CORS")); // Reject request
                  }
            },
            credentials: true, // Allow credentials (cookies)
      })
);

// Enable JSON body parsing
app.use(express.json());

app.use(cookieParser()); // Enable cookie parsing
app.use(express.json({ limit: "50mb" })); // Parse JSON requests
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded data
app.use(express.static("public")); // Serve static files

// Import Routes
import userRouter from "../src/routes/user.route.js";
import imageRoute from "../src/routes/image.route.js";
import blogRoute from "../src/routes/blog.route.js";

// Use Routes

// user route
app.use("/api/v1/user", userRouter);

app.use("/api/v1/image", imageRoute);
app.use("/api/v1/blog", blogRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something went wrong!");
});

export { app };
