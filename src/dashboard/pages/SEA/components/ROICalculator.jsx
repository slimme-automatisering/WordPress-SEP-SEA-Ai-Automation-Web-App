import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Pie, Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatPercentage = (value) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ROICalculator = ({ accountId, campaignId }) => {
  const theme = useTheme();
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchROI = async () => {
    if (!accountId || !campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/campaigns/${campaignId}/roi?` +
          new URLSearchParams({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
      );

      if (!response.ok) {
        throw new Error("Kon ROI gegevens niet ophalen");
      }

      const data = await response.json();
      setRoi(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchROI();
  }, [accountId, campaignId, dateRange]);

  if (loading && !roi) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!roi) {
    return null;
  }

  const costBreakdownData = {
    labels: ["Kosten", "Winst"],
    datasets: [
      {
        data: [
          roi.metrics.cost,
          Math.max(0, roi.metrics.value - roi.metrics.cost),
        ],
        backgroundColor: [theme.palette.error.main, theme.palette.success.main],
      },
    ],
  };

  const performanceData = {
    labels: ["Impressies", "Clicks", "Conversies"],
    datasets: [
      {
        label: "Prestaties",
        data: [
          roi.metrics.impressions,
          roi.metrics.clicks,
          roi.metrics.conversions,
        ],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
        ],
      },
    ],
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
            setDateRange({
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
            setDateRange({
              ...dateRange,
              endDate: e.target.value,
            })
          }
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* ROI Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ROI Overzicht
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Totale Kosten
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(roi.metrics.cost)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Totale Waarde
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(roi.metrics.value)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    ROI
                  </Typography>
                  <Typography
                    variant="h4"
                    color={roi.metrics.roi > 0 ? "success.main" : "error.main"}
                  >
                    {formatPercentage(roi.metrics.roi / 100)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Winst
                  </Typography>
                  <Typography
                    variant="h4"
                    color={
                      roi.metrics.value - roi.metrics.cost > 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {formatCurrency(roi.metrics.value - roi.metrics.cost)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kosten Verdeling
              </Typography>
              <Box height={300}>
                <Pie data={costBreakdownData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prestatie Metrics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Waarde</TableCell>
                      <TableCell align="right">Ratio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Impressies</TableCell>
                      <TableCell align="right">
                        {roi.metrics.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Clicks</TableCell>
                      <TableCell align="right">
                        {roi.metrics.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatPercentage(
                          roi.metrics.clicks / roi.metrics.impressions,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Conversies</TableCell>
                      <TableCell align="right">
                        {roi.metrics.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatPercentage(
                          roi.metrics.conversions / roi.metrics.clicks,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kosten per Click</TableCell>
                      <TableCell align="right">
                        {formatCurrency(roi.metrics.cost / roi.metrics.clicks)}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kosten per Conversie</TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          roi.metrics.cost / roi.metrics.conversions,
                        )}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Waarde per Conversie</TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          roi.metrics.value / roi.metrics.conversions,
                        )}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ROICalculator;
