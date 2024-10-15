import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // For environment variables

dotenv.config(); // Load environment variables

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
      process.env.SITE_ORIGIN_PROD, // Production frontend
      process.env.SITE_ORIGIN_LOCAL, // Local development frontend
];

// CORS Middleware (without credentials)
app.use(
      cors({
            origin: (origin, callback) => {
                  // Allow requests from allowed origins or non-browser requests
                  if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                  } else {
                        callback(new Error("Not allowed by CORS")); // Reject others
                  }
            },
      })
);

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
