describe("SEO API Endpoints", () => {
  beforeEach(() => {
    // Reset de API state voor elke test
    cy.request("GET", "/api/v1/health").as("healthCheck");
    cy.get("@healthCheck").its("status").should("eq", 200);
  });

  describe("Keyword Analyse", () => {
    it("moet keywords kunnen analyseren", () => {
      const keywords = ["seo", "optimization"];

      cy.request({
        method: "POST",
        url: "/api/v1/seo/analyze",
        body: { keywords },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("status", "success");
        expect(response.body.data)
          .to.have.property("keywords")
          .that.deep.equals(keywords);
        expect(response.body.data)
          .to.have.property("analysis")
          .that.is.a("string");
      });
    });

    it("moet een foutmelding geven bij ongeldige input", () => {
      cy.request({
        method: "POST",
        url: "/api/v1/seo/analyze",
        body: { keywords: "invalid" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
      });
    });

    it("moet rate limiting toepassen", () => {
      // Maak meer requests dan toegestaan
      const requests = Array(51)
        .fill()
        .map(() => {
          return cy.request({
            method: "POST",
            url: "/api/v1/seo/analyze",
            body: { keywords: ["test"] },
            failOnStatusCode: false,
          });
        });

      // De laatste request moet een 429 geven
      cy.wrap(requests[50]).then((response) => {
        expect(response.status).to.eq(429);
        expect(response.body).to.have.property("error");
      });
    });
  });

  describe("Keyword Suggesties", () => {
    it("moet suggesties kunnen ophalen", () => {
      cy.request({
        method: "GET",
        url: "/api/v1/seo/suggestions",
        qs: { keyword: "seo" },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("status", "success");
        expect(response.body.data).to.have.property("keyword", "seo");
        expect(response.body.data)
          .to.have.property("suggestions")
          .that.is.an("array");
      });
    });

    it("moet een foutmelding geven zonder keyword parameter", () => {
      cy.request({
        method: "GET",
        url: "/api/v1/seo/suggestions",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
      });
    });

    it("moet rate limiting toepassen", () => {
      // Maak meer requests dan toegestaan
      const requests = Array(201)
        .fill()
        .map(() => {
          return cy.request({
            method: "GET",
            url: "/api/v1/seo/suggestions",
            qs: { keyword: "test" },
            failOnStatusCode: false,
          });
        });

      // De laatste request moet een 429 geven
      cy.wrap(requests[200]).then((response) => {
        expect(response.status).to.eq(429);
        expect(response.body).to.have.property("error");
      });
    });
  });

  describe("API Documentatie", () => {
    it("moet de Swagger UI kunnen laden", () => {
      cy.request("/api-docs").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("text/html");
      });
    });

    it("moet de OpenAPI specificatie kunnen laden", () => {
      cy.request("/api-docs/swagger.json").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("application/json");
        expect(response.body).to.have.property("openapi", "3.0.0");
      });
    });
  });
});
