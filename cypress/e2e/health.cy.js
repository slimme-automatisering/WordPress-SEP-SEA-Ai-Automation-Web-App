describe("Health Check", () => {
  it("should check if the API is healthy", () => {
    cy.request({
      method: "GET",
      url: "/health",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("status", "healthy");
    });
  });
});
