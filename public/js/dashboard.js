import { formatDate, formatNumber, showNotification } from "./utils.js";

// Dashboard initialization
function initializeDashboard() {
  initializeOverviewCards();
  initializeCharts();
  initializeRecentActivity();
  startDashboardUpdates();
}

// Initialize overview cards with initial data
function initializeOverviewCards() {
  fetch("/api/dashboard/overview")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("total-content").textContent = formatNumber(
        data.totalContent,
      );
      document.getElementById("optimized-today").textContent = formatNumber(
        data.optimizedToday,
      );
      document.getElementById("avg-seo-score").textContent = formatNumber(
        data.averageSeoScore,
      );
      document.getElementById("next-run").textContent = formatDate(
        data.nextScheduledRun,
      );
    })
    .catch((error) => {
      console.error("Error fetching overview data:", error);
      showNotification("Fout bij het laden van overzichtsgegevens", "error");
    });
}

// Initialize dashboard charts
function initializeCharts() {
  initializeSEOTrendChart();
  initializeContentDistributionChart();
}

function initializeSEOTrendChart() {
  const ctx = document.getElementById("seo-trend-chart").getContext("2d");
  fetch("/api/dashboard/seo-trend")
    .then((response) => response.json())
    .then((data) => {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.dates,
          datasets: [
            {
              label: "Average SEO Score",
              data: data.scores,
              borderColor: "rgb(59, 130, 246)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error initializing SEO trend chart:", error);
    });
}

function initializeContentDistributionChart() {
  const ctx = document
    .getElementById("content-distribution-chart")
    .getContext("2d");
  fetch("/api/dashboard/content-distribution")
    .then((response) => response.json())
    .then((data) => {
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Posts", "Pages", "Products"],
          datasets: [
            {
              data: [data.posts, data.pages, data.products],
              backgroundColor: [
                "rgb(59, 130, 246)",
                "rgb(16, 185, 129)",
                "rgb(245, 158, 11)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error initializing content distribution chart:", error);
    });
}

// Initialize recent activity table
function initializeRecentActivity() {
  const table = document
    .getElementById("recent-activity-table")
    .getElementsByTagName("tbody")[0];

  fetch("/api/dashboard/recent-activity")
    .then((response) => response.json())
    .then((activities) => {
      table.innerHTML = activities
        .map(
          (activity) => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDate(activity.timestamp)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${activity.action}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${activity.content}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === "success"
                            ? "bg-green-100 text-green-800"
                            : activity.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }">
                            ${activity.status}
                        </span>
                    </td>
                </tr>
            `,
        )
        .join("");
    })
    .catch((error) => {
      console.error("Error loading recent activity:", error);
      showNotification("Failed to load recent activity", "error");
    });
}

// Start real-time dashboard updates
function startDashboardUpdates() {
  // Update overview cards every minute
  setInterval(() => {
    initializeOverviewCards();
  }, 60000);

  // Update recent activity every 30 seconds
  setInterval(() => {
    initializeRecentActivity();
  }, 30000);
}

// Handle real-time updates from WebSocket
function updateDashboardStats(data) {
  // Update overview cards
  if (data.overview) {
    document.getElementById("total-content").textContent = formatNumber(
      data.overview.totalContent,
    );
    document.getElementById("optimized-today").textContent = formatNumber(
      data.overview.optimizedToday,
    );
    document.getElementById("avg-seo-score").textContent = formatNumber(
      data.overview.averageSeoScore,
    );
    document.getElementById("next-run").textContent = formatDate(
      data.overview.nextScheduledRun,
    );
  }

  // Update recent activity
  if (data.activity) {
    const table = document
      .getElementById("recent-activity-table")
      .getElementsByTagName("tbody")[0];
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(data.activity.timestamp)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${data.activity.action}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${data.activity.content}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  data.activity.status === "success"
                    ? "bg-green-100 text-green-800"
                    : data.activity.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }">
                    ${data.activity.status}
                </span>
            </td>
        `;
    table.insertBefore(newRow, table.firstChild);

    // Remove oldest row if more than 10 rows
    if (table.children.length > 10) {
      table.removeChild(table.lastChild);
    }
  }
}

// Fetch performance data from the API
async function fetchPerformanceData() {
  const response = await fetch("/api/performance/analyze");
  const data = await response.json();
  // Update the chart with the fetched data
  const ctx = document.getElementById("performance-chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.dates,
      datasets: [
        {
          label: "Performance",
          data: data.values,
          backgroundColor: "rgb(59, 130, 246)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Fetch sitemap status from the API
async function fetchSitemapStatus() {
  const response = await fetch("/api/sitemap/generate");
  const data = await response.json();
  // Update the UI with sitemap status
  document.getElementById("sitemap-status").textContent = data.status;
}

// Initialize the dashboard
function initDashboard() {
  fetchPerformanceData();
  fetchSitemapStatus();
  initializeDashboard();
}

document.addEventListener("DOMContentLoaded", initDashboard);
