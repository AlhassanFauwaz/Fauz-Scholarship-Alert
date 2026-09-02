import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import opportunityRoutes from "./routes/opportunities.js";
import sourceRoutes from "./routes/sources.js";
import matchingRoutes from "./routes/matching.js";
import savedOpportunityRoutes from "./routes/savedOpportunities.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import { startDeadlineScheduler } from "./jobs/deadlineScheduler.js";
import { startCollectorScheduler } from "./jobs/collectorScheduler.js";
import { seedInitialSources } from "./services/collectorService.js";

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://fauz-scholarship-alert-1-ghxp.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin === o || origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development/production transition
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Fauz Opportunity Alert API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/saved-opportunities", savedOpportunityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialSources();
    startDeadlineScheduler();
    startCollectorScheduler();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
