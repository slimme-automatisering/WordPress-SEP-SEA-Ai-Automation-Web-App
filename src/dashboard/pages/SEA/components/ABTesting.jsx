import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 1000000);
};

const formatPercentage = (value) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ABTesting = ({ accountId }) => {
  const theme = useTheme();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "SEARCH_CUSTOM",
    status: "ENABLED",
    startDate: "",
    endDate: "",
    description: "",
  });

  const fetchExperiments = async () => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/experiments`);

      if (!response.ok) {
        throw new Error("Kon experimenten niet ophalen");
      }

      const data = await response.json();
      setExperiments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [accountId]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/experiments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Kon experiment niet aanmaken");
      }

      await fetchExperiments();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "SEARCH_CUSTOM",
      status: "ENABLED",
      startDate: "",
      endDate: "",
      description: "",
    });
    setSelectedExperiment(null);
  };

  if (loading && !experiments.length) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const experimentPerformanceData = {
    labels: experiments.map((exp) => exp.name),
    datasets: [
      {
        label: "CTR",
        data: experiments.map(
          (exp) => exp.metrics.clicks / exp.metrics.impressions,
        ),
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: "Conversie Ratio",
        data: experiments.map(
          (exp) => exp.metrics.conversions / exp.metrics.clicks,
        ),
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Ratio",
        },
      },
    },
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">A/B Tests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Nieuwe Test
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Active Experiments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actieve Experimenten
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Naam</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Datum</TableCell>
                      <TableCell>Eind Datum</TableCell>
                      <TableCell align="right">Impressies</TableCell>
                      <TableCell align="right">CTR</TableCell>
                      <TableCell align="right">Conversie Ratio</TableCell>
                      <TableCell align="right">Acties</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {experiments.map((experiment) => (
                      <TableRow key={experiment.resource_name}>
                        <TableCell>{experiment.name}</TableCell>
                        <TableCell>{experiment.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={experiment.status}
                            color={
                              experiment.status === "ENABLED"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(experiment.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {experiment.end_date
                            ? new Date(experiment.end_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {experiment.metrics.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(
                            experiment.metrics.clicks /
                              experiment.metrics.impressions,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(
                            experiment.metrics.conversions /
                              experiment.metrics.clicks,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color={
                              experiment.status === "ENABLED"
                                ? "error"
                                : "success"
                            }
                          >
                            {experiment.status === "ENABLED" ? (
                              <StopIcon />
                            ) : (
                              <StartIcon />
                            )}
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Experiment Prestaties
              </Typography>
              <Box height={400}>
                <Bar data={experimentPerformanceData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedExperiment ? "Experiment Bewerken" : "Nieuw Experiment"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Naam"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                label="Type"
              >
                <MenuItem value="SEARCH_CUSTOM">Zoeken - Custom</MenuItem>
                <MenuItem value="DISPLAY_CUSTOM">Display - Custom</MenuItem>
                <MenuItem value="SHOPPING_CUSTOM">Shopping - Custom</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="Status"
              >
                <MenuItem value="ENABLED">Actief</MenuItem>
                <MenuItem value="PAUSED">Gepauzeerd</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Datum"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Eind Datum"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Beschrijving"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Annuleren
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Opslaan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ABTesting;
