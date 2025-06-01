


import http from 'http';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configure the application to serve on multiple ports as required
  const primaryPort = 54903;
  const secondaryPort = 59712;

  // Start server on primary port
  server.listen({
    port: primaryPort,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on primary port ${primaryPort}`);
  });

  // Create a second Express app instance for the secondary port
  const app2 = express();
  await registerRoutes(app2);

  if (app.get("env") === "development") {
    await setupVite(app2, http.createServer(app2));
  } else {
    serveStatic(app2);
  }

  // Start server on secondary port
  const server2 = http.createServer(app2);
  server2.listen({
    port: secondaryPort,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on secondary port ${secondaryPort}`);
  });
})();

