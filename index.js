import express from "express";
import { config } from "./config.js";
import messageRoutes from "./route/messageRoute.js";
import { randomUUID } from "node:crypto";
import { log } from "./service/logger.js";

const app = express();

app.use((req, res, next) => {
  req.requestId = randomUUID();
  const started = Date.now();
  // Classify the route rather than logging arbitrary URLs or query strings.
  const route = req.path === "/telegram/webhook" ? "webhook" : req.path === "/" ? "health" : "unmatched";
  log("http.received", { requestId: req.requestId, route });
  res.on("finish", () => {
    log("http.completed", { requestId: req.requestId, route, status: res.statusCode, durationMs: Date.now() - started });
  });
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Telegram bot server is running" });
});

app.use("/telegram", messageRoutes);

app.use((req, res) => {
  log("http.route_not_found", { requestId: req.requestId }, "warn");
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  log("http.error", { requestId: req.requestId, status }, "error");
  res.sendStatus(status);
});

const server = app.listen(config.port, () => {
  log("server.started", { port: config.port, webhookPath: "/telegram/webhook" });
});

server.on("error", (error) => {
  log("server.failed", { reason: error.code === "EADDRINUSE" ? "port_in_use" : "listen_failed" }, "error");
  process.exitCode = 1;
});
