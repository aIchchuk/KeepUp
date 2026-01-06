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
app.use(cors());
app.use(helmet());

// Rate Limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
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
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log(err));
