import request from "supertest";
import express from "express";
import session from "express-session";
import { configureSecurityMiddleware } from "../../src/middleware/security.js";

describe("Security Middleware", () => {
  let app;

  beforeEach(() => {
    app = express();

    // Body parser middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Sessie middleware toevoegen voor CSRF
    app.use(
      session({
        secret: "test-secret",
        resave: false,
        saveUninitialized: true,
      }),
    );

    // Security middleware
    configureSecurityMiddleware(app);

    // Test routes
    app.get("/test", (req, res) => {
      res.json({ message: "test" });
    });

    app.post("/test", (req, res) => {
      res.json({ message: "test post" });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
      });
    });
  });

  describe("Security Headers", () => {
    it("should set security headers", async () => {
      const response = await request(app).get("/test");

      // Helmet headers
      expect(response.headers["x-dns-prefetch-control"]).toBe("off");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-xss-protection"]).toBe("1; mode=block");

      // CSP headers
      expect(response.headers["content-security-policy"]).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      const response = await request(app)
        .get("/test")
        .set("X-Forwarded-For", "1.2.3.4-rate-limit-test");
      expect(response.status).toBe(200);
    });

    it("should block requests exceeding rate limit", async () => {
      const ip = "1.2.3.4-rate-limit-block-test";

      // Maak 4 requests (rate limit is 3)
      for (let i = 0; i < 3; i++) {
        await request(app).get("/test").set("X-Forwarded-For", ip);
      }

      // Deze request zou geblokkeerd moeten worden
      const response = await request(app)
        .get("/test")
        .set("X-Forwarded-For", ip);

      expect(response.status).toBe(429);
    }, 10000);
  });

  describe("CSRF Protection", () => {
    it("should allow GET requests without CSRF token", async () => {
      const response = await request(app)
        .get("/test")
        .set("X-Forwarded-For", "1.2.3.4-csrf-get-test");
      expect(response.status).toBe(200);
    });

    it("should block POST requests without CSRF token", async () => {
      const response = await request(app)
        .post("/test")
        .set("X-Forwarded-For", "1.2.3.4-csrf-post-test");
      expect(response.status).toBe(403);
      expect(response.body.error).toBe("CSRF token validation failed");
    });
  });

  describe("HPP (HTTP Parameter Pollution)", () => {
    it("should handle parameter pollution correctly", async () => {
      const response = await request(app)
        .get("/test?foo=bar&foo=baz")
        .set("X-Forwarded-For", "1.2.3.4-hpp-test");

      expect(response.status).toBe(200);
    });
  });
});
