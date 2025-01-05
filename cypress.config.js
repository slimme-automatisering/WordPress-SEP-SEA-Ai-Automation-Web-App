import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: "http://localhost:3000/api/v1",
    },
    setupNodeEvents(on, config) {
      // Event listeners voor logging
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });

      // Resultaten opslaan per test run
      const testRunId = new Date().toISOString().replace(/[:.]/g, "-");
      config.reporterOptions = {
        reportDir: `cypress/results/${testRunId}`,
        overwrite: false,
        html: true,
        json: true,
      };

      return config;
    },
  },
  retries: {
    runMode: {
      tries: 3,
      delay: 1000, // 1 seconde tussen retries
    },
    openMode: {
      tries: 1, // Geen retries in open mode voor snellere development
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  watchForFileChanges: true,
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/results/junit/results-[hash].xml",
    toConsole: true,
  },
});
