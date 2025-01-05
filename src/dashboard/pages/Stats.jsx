import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Box,
  IconButton,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { nl } from "date-fns/locale";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, subDays } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const exportFormats = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [exportFormat, setExportFormat] = useState("csv");
  const [error, setError] = useState(null);

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch("/api/analytics/realtime");
      const data = await response.json();
      setRealtimeData(data);
    } catch (error) {
      console.error("Error fetching realtime data:", error);
      setError("Kon realtime data niet ophalen");
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: format(dateRange.start, "yyyy-MM-dd"),
          endDate: format(dateRange.end, "yyyy-MM-dd"),
        }),
      });
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Kon analytics data niet ophalen");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: format(dateRange.start, "yyyy-MM-dd"),
          endDate: format(dateRange.end, "yyyy-MM-dd"),
          format: exportFormat,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Export mislukt");
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchRealtimeData();

    // Realtime data update elke 30 seconden
    const realtimeInterval = setInterval(fetchRealtimeData, 30000);

    return () => clearInterval(realtimeInterval);
  }, [dateRange]);

  if (loading && !analyticsData) {
    return <CircularProgress />;
  }

  const chartData = analyticsData
    ? {
        labels: analyticsData.dates,
        datasets: [
          {
            label: "Bezoekers",
            data: analyticsData.metrics.users,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.1)",
          },
          {
            label: "Paginaweergaven",
            data: analyticsData.metrics.pageviews,
            borderColor: "rgb(153, 102, 255)",
            tension: 0.1,
            fill: true,
            backgroundColor: "rgba(153, 102, 255, 0.1)",
          },
        ],
      }
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
      <div>
        <Typography variant="h4" gutterBottom>
          Dashboard Overzicht
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Realtime Stats */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h6">Realtime Statistieken</Typography>
                <IconButton onClick={fetchRealtimeData}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              <Grid container spacing={3}>
                {realtimeData &&
                  Object.entries(realtimeData).map(([key, value]) => (
                    <Grid item xs={12} sm={4} key={key}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            {key === "activeUsers"
                              ? "Actieve Gebruikers"
                              : key === "pageviews"
                                ? "Paginaweergaven"
                                : "Sessies"}
                          </Typography>
                          <Typography variant="h5">{value}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Date Range Selector */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <DatePicker
                  label="Start Datum"
                  value={dateRange.start}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, start: newValue }))
                  }
                />
                <DatePicker
                  label="Eind Datum"
                  value={dateRange.end}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, end: newValue }))
                  }
                />
                <TextField
                  select
                  label="Export Formaat"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  {exportFormats.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Exporteer
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Analytics Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Bezoekers & Paginaweergaven
              </Typography>
              {chartData && (
                <Box sx={{ height: 400 }}>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        intersect: false,
                        mode: "index",
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </LocalizationProvider>
  );
}
