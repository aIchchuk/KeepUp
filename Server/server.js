import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssMiddleware from "./middleware/xss.middleware.js";
import csrfMiddleware from "./middleware/csrf.middleware.js";

// Routes
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import templateRoutes from "./routes/template.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Enhanced Security with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline might be needed for some dev tools, but ideally 'self' only
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"], // Allow common image sources
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Sanitize user input against XSS
app.use(xssMiddleware);

// CSRF Protection
app.use(csrfMiddleware);

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts, please try again after 15 minutes"
});

// Routes
app.use("/api/users/login", loginLimiter); // Apply only to login for better UX
app.use("/api/users", userRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/projects/:id/tasks", taskRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/logs", activityRoutes);
app.use("/api/payment", paymentRoutes);

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

