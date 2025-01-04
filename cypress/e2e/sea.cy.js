describe('SEA API Endpoints', () => {
  beforeEach(() => {
    // Reset de API state voor elke test
    cy.request('GET', '/api/v1/health').as('healthCheck');
    cy.get('@healthCheck').its('status').should('eq', 200);
  });

  describe('Campagne Analyse', () => {
    it('moet een campagne kunnen analyseren', () => {
      const campaignId = '123456789';
      
      cy.request({
        method: 'GET',
        url: `/api/v1/sea/campaigns/${campaignId}/analyze`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body.data).to.have.property('campaignId', campaignId);
        expect(response.body.data).to.have.property('analysis').that.is.a('string');
      });
    });

    it('moet een foutmelding geven bij ongeldige campaign ID', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/sea/campaigns/invalid/analyze',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('moet rate limiting toepassen', () => {
      const campaignId = '123456789';
      // Maak meer requests dan toegestaan
      const requests = Array(51).fill().map(() => {
        return cy.request({
          method: 'GET',
          url: `/api/v1/sea/campaigns/${campaignId}/analyze`,
          failOnStatusCode: false
        });
      });

      // De laatste request moet een 429 geven
      cy.wrap(requests[50]).then((response) => {
        expect(response.status).to.eq(429);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Advertentie Performance', () => {
    it('moet performance metrics kunnen ophalen', () => {
      const adId = '987654321';
      
      cy.request({
        method: 'GET',
        url: `/api/v1/sea/ads/${adId}/performance`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body.data).to.have.property('adId', adId);
        expect(response.body.data).to.have.property('performance').that.is.an('object');
        expect(response.body.data.performance).to.have.all.keys(
          'clicks',
          'impressions',
          'ctr',
          'conversions'
        );
      });
    });

    it('moet een foutmelding geven bij ongeldige ad ID', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/sea/ads/invalid/performance',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Budget Optimalisatie', () => {
    it('moet budget kunnen optimaliseren', () => {
      const campaignId = '123456789';
      
      cy.request({
        method: 'POST',
        url: `/api/v1/sea/campaigns/${campaignId}/optimize`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body.data).to.have.property('campaignId', campaignId);
        expect(response.body.data).to.have.property('recommendations').that.is.a('string');
      });
    });

    it('moet een foutmelding geven bij ongeldige campaign ID', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/sea/campaigns/invalid/optimize',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('moet CSRF bescherming hebben', () => {
      const campaignId = '123456789';
      
      cy.request({
        method: 'POST',
        url: `/api/v1/sea/campaigns/${campaignId}/optimize`,
        headers: {
          // Geen CSRF token
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Security Headers', () => {
    const endpoints = [
      '/api/v1/sea/campaigns/123/analyze',
      '/api/v1/sea/ads/456/performance',
      '/api/v1/sea/campaigns/789/optimize'
    ];

    endpoints.forEach((endpoint) => {
      it(`moet security headers hebben voor ${endpoint}`, () => {
        cy.request(endpoint).then((response) => {
          expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
          expect(response.headers).to.have.property('x-frame-options', 'DENY');
          expect(response.headers).to.have.property('x-xss-protection', '1; mode=block');
          expect(response.headers).to.have.property('strict-transport-security');
        });
      });
    });
  });
});
