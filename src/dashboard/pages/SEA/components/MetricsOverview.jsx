import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 1000000); // Convert from micros
};

const formatPercentage = (value) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const MetricsOverview = ({ accountId, dateRange, onDateRangeChange }) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!accountId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/google-ads/${accountId}/metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        );

        if (!response.ok) {
          throw new Error("Kon metrics niet ophalen");
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [accountId, dateRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!metrics) {
    return null;
  }

  const chartData = {
    labels: metrics.map((m) => m.date),
    datasets: [
      {
        label: "Kosten",
        data: metrics.map((m) => m.cost_micros / 1000000),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        yAxisID: "y1",
      },
      {
        label: "Clicks",
        data: metrics.map((m) => m.clicks),
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
        yAxisID: "y2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y1: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Kosten (€)",
        },
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Clicks",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Bereken totalen
  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      cost_micros: acc.cost_micros + m.cost_micros,
      conversions: acc.conversions + m.conversions,
    }),
    {
      impressions: 0,
      clicks: 0,
      cost_micros: 0,
      conversions: 0,
    },
  );

  // Bereken gemiddelden
  const averages = {
    ctr: totals.clicks / totals.impressions,
    cpc: totals.cost_micros / totals.clicks,
    conversionRate: totals.conversions / totals.clicks,
  };

  return (
    <Box>
      {/* Date Range Selector */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Start Datum"
          type="date"
          value={dateRange.startDate}
          onChange={(e) =>
            onDateRangeChange({
              ...dateRange,
              startDate: e.target.value,
            })
          }
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Eind Datum"
          type="date"
          value={dateRange.endDate}
          onChange={(e) =>
            onDateRangeChange({
              ...dateRange,
              endDate: e.target.value,
            })
          }
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Impressies
              </Typography>
              <Typography variant="h4">
                {totals.impressions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clicks
              </Typography>
              <Typography variant="h4">
                {totals.clicks.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Kosten
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totals.cost_micros)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversies
              </Typography>
              <Typography variant="h4">
                {totals.conversions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Average Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                CTR
              </Typography>
              <Typography variant="h5">
                {formatPercentage(averages.ctr)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gem. CPC
              </Typography>
              <Typography variant="h5">
                {formatCurrency(averages.cpc)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversie Ratio
              </Typography>
              <Typography variant="h5">
                {formatPercentage(averages.conversionRate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Prestaties Overzicht
          </Typography>
          <Box height={400}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricsOverview;
