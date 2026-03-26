import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import scrapeRouter from "./routes/scrape";
import trendsRouter from "./routes/trends";
import friendsRouter from "./routes/friends";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ─── Middleware ───

app.use(cors());
app.use(express.json());

// ─── Request logging ───

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───

app.use("/api/scrape", scrapeRouter);
app.use("/api", trendsRouter);      // /api/trends, /api/posts, /api/posts/:id
app.use("/api", friendsRouter);     // /api/me, /api/friends, /api/consume

// ─── Health check ───

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler ───

interface ErrorResponse {
  error: string;
  message: string;
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[error]", err.message);
    const response: ErrorResponse = {
      error: "Internal Server Error",
      message: err.message,
    };
    res.status(500).json(response);
  }
);

// ─── Start ───

app.listen(PORT, () => {
  console.log(`\n🧠 Brainrot Tracker API running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/scrape          - Scrape & analyze hashtags`);
  console.log(`  GET  /api/trends          - Trending brainrot content`);
  console.log(`  GET  /api/posts           - All scored posts`);
  console.log(`  GET  /api/posts/:id       - Single post details`);
  console.log(`  GET  /api/me              - Your profile & cooked score`);
  console.log(`  GET  /api/friends         - Friends list with health bars`);
  console.log(`  POST /api/consume         - Log consuming a post`);
  console.log(`  GET  /api/health          - Health check\n`);
});
