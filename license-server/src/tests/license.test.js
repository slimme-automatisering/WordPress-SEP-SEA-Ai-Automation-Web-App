const request = require("supertest");
const { v4: uuidv4 } = require("uuid");
const app = require("../index");
const { pool } = require("../database");

describe("License API Tests", () => {
  let testLicenseKey;
  let testToken;

  beforeAll(async () => {
    // Maak test database tabellen aan
    await pool.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id UUID PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        key VARCHAR(255) UNIQUE NOT NULL,
        company_name VARCHAR(255),
        domains TEXT[],
        features JSONB,
        valid_until TIMESTAMP NOT NULL,
        max_api_calls INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS license_usage (
        id UUID PRIMARY KEY,
        license_id UUID REFERENCES licenses(id),
        api_calls INTEGER DEFAULT 0,
        date DATE DEFAULT CURRENT_DATE,
        features_used JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });

  beforeEach(async () => {
    // Maak een test licentie aan
    testLicenseKey = uuidv4();
    const result = await pool.query(
      "INSERT INTO licenses (id, type, key, company_name, valid_until, max_api_calls) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        uuidv4(),
        "trial",
        testLicenseKey,
        "Test Company",
        new Date(Date.now() + 86400000),
        1000,
      ],
    );

    // Verkrijg een test token
    const response = await request(app)
      .post("/api/v1/licenses/verify")
      .send({ key: testLicenseKey });

    testToken = response.body.token;
  });

  afterEach(async () => {
    // Verwijder test data
    await pool.query("DELETE FROM license_usage");
    await pool.query("DELETE FROM licenses");
  });

  describe("POST /api/v1/licenses/verify", () => {
    it("should verify a valid license", async () => {
      const response = await request(app)
        .post("/api/v1/licenses/verify")
        .send({ key: testLicenseKey });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("valid", true);
      expect(response.body).toHaveProperty("token");
    });

    it("should reject an invalid license", async () => {
      const response = await request(app)
        .post("/api/v1/licenses/verify")
        .send({ key: "invalid-key" });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/licenses/status/:key", () => {
    it("should return license status", async () => {
      const response = await request(app).get(
        `/api/v1/licenses/status/${testLicenseKey}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("type", "trial");
      expect(response.body).toHaveProperty("is_active", true);
    });
  });

  describe("POST /api/v1/licenses/activate", () => {
    it("should activate a new license", async () => {
      const newKey = uuidv4();
      const response = await request(app)
        .post("/api/v1/licenses/activate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          key: newKey,
          companyName: "New Company",
          domains: ["example.com"],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Licentie succesvol geactiveerd",
      );
    });
  });

  describe("PUT /api/v1/licenses/deactivate", () => {
    it("should deactivate a license", async () => {
      const response = await request(app)
        .put("/api/v1/licenses/deactivate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ key: testLicenseKey });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Licentie succesvol gedeactiveerd",
      );
    });
  });

  describe("POST /api/v1/licenses/upgrade", () => {
    it("should upgrade a license", async () => {
      const response = await request(app)
        .post("/api/v1/licenses/upgrade")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          key: testLicenseKey,
          newType: "professional",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("type", "professional");
    });

    it("should reject invalid upgrade type", async () => {
      const response = await request(app)
        .post("/api/v1/licenses/upgrade")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          key: testLicenseKey,
          newType: "invalid-type",
        });

      expect(response.status).toBe(400);
    });
  });
});
