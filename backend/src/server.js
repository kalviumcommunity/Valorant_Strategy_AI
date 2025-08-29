import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import strategyRoutes from "./routes/strategy.js";
import oneShotRoute from "./routes/oneShotStrategy.js";
import multiShotRoute from "./routes/multiShotStrategy.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic rate limiter to keep local demos stable
app.use(
    "/api/",
    rateLimit({
        windowMs: 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false
    })
);

// Routes
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/strategy", strategyRoutes);
app.use("/api/strategy/one-shot", oneShotRoute);
app.use("/api/strategy/multi-shot", multiShotRoute);

// Start
app.listen(PORT, () => {
    console.log(`Valorant AI backend running on http://localhost:${PORT}`);
});
