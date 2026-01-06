import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


// Routes
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import templateRoutes from "./routes/template.routes.js";
import activityRoutes from "./routes/activity.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Simple Request Logger
app.use((req, reqRes, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


// Rate Limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Loosened for development
    message: { message: "Too many login attempts, please try again after 15 minutes" }
});



// Routes
app.use("/api/users/login", loginLimiter); // Apply only to login for better UX
app.use("/api/users", userRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/projects/:id/tasks", taskRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/logs", activityRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
try {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        })
        .catch((err) => {
            console.error("Mongoose connection promise error:", err);
            process.exit(1);
        });
} catch (error) {
    console.error("Global startup error logic:", error);
    process.exit(1);
}

