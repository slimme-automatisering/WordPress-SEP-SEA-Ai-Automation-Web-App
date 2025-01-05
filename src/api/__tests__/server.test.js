import request from "supertest";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configureSecurityMiddleware } from "../src/middleware/security.js";

describe("Server Configuration", () => {
  let app;

  beforeEach(() => {
    app = express();

    // Trust proxy
    app.set("trust proxy", 1);

    // Body parser middleware (voor de security middleware)
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Security middleware (zonder rate limiter voor tests)
    app.use((req, res, next) => {
      // Skip rate limiting in tests
      if (process.env.NODE_ENV === "test") {
        next();
      } else {
        configureSecurityMiddleware(app);
      }
    });

    // Regular middleware
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      }),
    );
    app.use(compression());
    app.use(morgan("dev"));
    app.use(cookieParser());

    // Session middleware
    app.use(
      session({
        secret: "test-secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      }),
    );

    // Test routes
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });
  });

  describe("Basic Configuration", () => {
    it("should have trust proxy enabled", () => {
      expect(app.get("trust proxy")).toBe(1);
    });

    it("should parse JSON", async () => {
      app.post("/test-json", (req, res) => {
        res.json(req.body);
      });

      const response = await request(app)
        .post("/test-json")
        .send({ test: "data" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ test: "data" });
    });

    it("should parse URL-encoded bodies", async () => {
      app.post("/test-urlencoded", (req, res) => {
        res.json(req.body);
      });

      const response = await request(app)
        .post("/test-urlencoded")
        .type("form")
        .send("test=data");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ test: "data" });
    });

    it("should handle CORS", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000",
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should reject requests from unauthorized origins", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Origin", "http://evil.com");

      expect(response.headers["access-control-allow-origin"]).not.toBe(
        "http://evil.com",
      );
    });
  });

  describe("Session Management", () => {
    it("should set session cookie", async () => {
      app.get("/test-session", (req, res) => {
        req.session.test = "data";
        res.json({ ok: true });
      });

      const response = await request(app).get("/test-session");

      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toContain("connect.sid");
    });

    it("should maintain session data", async () => {
      app.get("/set-session", (req, res) => {
        req.session.test = "data";
        res.json({ ok: true });
      });

      app.get("/get-session", (req, res) => {
        res.json({ test: req.session.test });
      });

      const agent = request.agent(app);

      await agent.get("/set-session");
      const response = await agent.get("/get-session");

      expect(response.body).toEqual({ test: "data" });
    });
  });

  describe("API Endpoints", () => {
    it("should return ok for health check", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      app.get("/error", (req, res, next) => {
        next(new Error("Test error"));
      });

      app.get("/async-error", async (req, res, next) => {
        next(new Error("Async test error"));
      });

      // Error handling middleware
      app.use((err, req, res, next) => {
        res.status(500).json({
          status: "error",
          message: err.message,
        });
      });
    });

    it("should handle synchronous errors", async () => {
      const response = await request(app).get("/error");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "error",
        message: "Test error",
      });
    });

    it("should handle asynchronous errors", async () => {
      const response = await request(app).get("/async-error");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "error",
        message: "Async test error",
      });
    });
  });
});
