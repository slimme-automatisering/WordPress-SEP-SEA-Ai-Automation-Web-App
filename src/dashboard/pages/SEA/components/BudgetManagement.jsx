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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 1000000); // Convert from micros
};

const BudgetManagement = ({ accountId, campaignId }) => {
  const theme = useTheme();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    amount_micros: 0,
    delivery_method: "STANDARD",
  });

  const fetchBudget = async () => {
    if (!accountId || !campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/campaigns/${campaignId}/budget`,
      );

      if (!response.ok) {
        throw new Error("Kon budget informatie niet ophalen");
      }

      const data = await response.json();
      setBudget(data);
      setFormData({
        amount_micros: data.campaign_budget.amount_micros,
        delivery_method: data.campaign_budget.delivery_method,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [accountId, campaignId]);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/campaigns/${campaignId}/budget`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon budget niet bijwerken");
      }

      await fetchBudget();
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !budget) {
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

  if (!budget) {
    return null;
  }

  const spendingData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Budget",
        data: [
          budget.campaign_budget.amount_micros / 1000000,
          budget.campaign_budget.amount_micros / 1000000,
          budget.campaign_budget.amount_micros / 1000000,
          budget.campaign_budget.amount_micros / 1000000,
        ],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        borderDash: [5, 5],
      },
      {
        label: "Uitgaven",
        data: [
          budget.metrics.cost_micros / 1000000,
          (budget.metrics.cost_micros / 1000000) * 0.8,
          (budget.metrics.cost_micros / 1000000) * 1.2,
          budget.metrics.cost_micros / 1000000,
        ],
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
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
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Budget (€)",
        },
      },
    },
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Budget Overzicht</Typography>
                <IconButton onClick={() => setOpenDialog(true)} size="small">
                  <EditIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Dagelijks Budget
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(budget.campaign_budget.amount_micros)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Uitgaven (deze maand)
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(budget.metrics.cost_micros)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Conversies
                  </Typography>
                  <Typography variant="h4">
                    {budget.metrics.conversions}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Conversiewaarde
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(budget.metrics.conversions_value)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Prestaties
              </Typography>
              <Box height={300}>
                <Line data={spendingData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Budget Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Budget Bewerken</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Dagelijks Budget (€)"
              type="number"
              value={formData.amount_micros / 1000000}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount_micros: Math.round(
                    parseFloat(e.target.value) * 1000000,
                  ),
                })
              }
              fullWidth
              InputProps={{
                startAdornment: "€",
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Leveringsmethode</InputLabel>
              <Select
                value={formData.delivery_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_method: e.target.value,
                  })
                }
                label="Leveringsmethode"
              >
                <MenuItem value="STANDARD">Standaard</MenuItem>
                <MenuItem value="ACCELERATED">Versneld</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuleren</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Opslaan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetManagement;
