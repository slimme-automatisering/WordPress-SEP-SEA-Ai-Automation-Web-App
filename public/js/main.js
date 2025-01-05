import {
  formatDate,
  formatNumber,
  showNotification,
  initializeLegacySupport,
} from "./utils.js";

// Initialize legacy support voor oude code
initializeLegacySupport();

// Navigation handling
function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute("data-page");

      // Update navigation
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Update pages
      pages.forEach((page) => {
        if (page.id === `${targetPage}-page`) {
          page.classList.remove("hidden");
          page.classList.add("active");
        } else {
          page.classList.add("hidden");
          page.classList.remove("active");
        }
      });

      // Update URL hash
      window.location.hash = targetPage;
    });
  });

  // Handle initial page load
  const hash = window.location.hash.slice(1) || "dashboard";
  document.querySelector(`[data-page="${hash}"]`)?.click();
}

// Real-time updates
function startRealTimeUpdates() {
  const ws = new WebSocket(`ws://${window.location.host}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleRealtimeUpdate(data);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    showNotification("WebSocket verbinding fout", "error");
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed. Attempting to reconnect...");
    setTimeout(startRealTimeUpdates, 5000);
  };
}

function handleRealtimeUpdate(data) {
  switch (data.type) {
    case "optimization":
      updateOptimizationStatus(data);
      break;
    case "analysis":
      updateCompetitorAnalysis(data);
      break;
    case "log":
      updateActivityLog(data);
      break;
    case "stats":
      updateDashboardStats(data);
      break;
  }
}

// Update functies
async function updateDashboardStats(data = null) {
  try {
    if (!data) {
      const response = await fetch("/api/dashboard/stats");
      data = await response.json();
    }
    // Update dashboard UI met nieuwe data
    console.log("Dashboard stats bijgewerkt:", data);
  } catch (error) {
    console.error("Fout bij updaten dashboard stats:", error);
    showNotification("Fout bij updaten dashboard stats", "error");
  }
}

async function updateOptimizationStatus(data = null) {
  try {
    if (!data) {
      const response = await fetch("/api/optimization/status");
      data = await response.json();
    }
    // Update optimalisatie UI met nieuwe data
    console.log("Optimalisatie status bijgewerkt:", data);
  } catch (error) {
    console.error("Fout bij updaten optimalisatie status:", error);
    showNotification("Fout bij updaten optimalisatie status", "error");
  }
}

async function updateCompetitorAnalysis(data = null) {
  try {
    if (!data) {
      const response = await fetch("/api/competitors/analysis");
      data = await response.json();
    }
    // Update competitor analyse UI met nieuwe data
    console.log("Competitor analyse bijgewerkt:", data);
  } catch (error) {
    console.error("Fout bij updaten competitor analyse:", error);
    showNotification("Fout bij updaten competitor analyse", "error");
  }
}

async function updateActivityLog(data = null) {
  try {
    if (!data) {
      const response = await fetch("/api/logs/activity");
      data = await response.json();
    }
    // Update activity log UI met nieuwe data
    console.log("Activity log bijgewerkt:", data);
  } catch (error) {
    console.error("Fout bij updaten activity log:", error);
    showNotification("Fout bij updaten activity log", "error");
  }
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  updateDashboardStats();
  updateOptimizationStatus();
  updateCompetitorAnalysis();
  updateActivityLog();
  startRealTimeUpdates();

  // Start periodieke updates
  setInterval(() => {
    const path = window.location.pathname;
    if (path.includes("optimization")) updateOptimizationStatus();
    if (path.includes("competitors")) updateCompetitorAnalysis();
    if (path.includes("logs")) updateActivityLog();
    if (path === "/" || path.includes("dashboard")) updateDashboardStats();
  }, 30000);
});

export {
  updateDashboardStats,
  updateOptimizationStatus,
  updateCompetitorAnalysis,
  updateActivityLog,
};
