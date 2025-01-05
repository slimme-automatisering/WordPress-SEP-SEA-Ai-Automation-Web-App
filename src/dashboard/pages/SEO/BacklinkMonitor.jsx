import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

const statusColors = {
  active: "success",
  lost: "error",
  new: "info",
};

const BacklinkMonitor = () => {
  const theme = useTheme();
  const [domain, setDomain] = useState("");
  const [backlinks, setBacklinks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");

  const fetchBacklinks = async () => {
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/backlinks/${domain}?page=${page + 1}&limit=${rowsPerPage}&status=${status}`,
      );

      if (!response.ok) {
        throw new Error("Kon backlinks niet ophalen");
      }

      const data = await response.json();
      setBacklinks(data.backlinks);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!domain) {
      setError("Voer een domein in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/backlinks/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        throw new Error("Backlink check mislukt");
      }

      const data = await response.json();
      setBacklinks(data.backlinks);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/backlinks/${domain}/export?format=${exportFormat}`,
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backlinks-${domain}-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Export mislukt");
    }
  };

  useEffect(() => {
    if (domain) {
      fetchBacklinks();
    }
  }, [page, rowsPerPage, status]);

  const chartData = metrics
    ? {
        labels: ["Actief", "Verloren", "Nieuw"],
        datasets: [
          {
            label: "Backlinks per Status",
            data: [metrics.active, metrics.lost, metrics.new],
            backgroundColor: [
              theme.palette.success.light,
              theme.palette.error.light,
              theme.palette.info.light,
            ],
            borderColor: [
              theme.palette.success.main,
              theme.palette.error.main,
              theme.palette.info.main,
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Backlink Monitor
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Domein"
                variant="outlined"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />
              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SearchIcon />
                }
                onClick={handleCheck}
                disabled={loading}
              >
                Controleren
              </Button>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Export</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={!backlinks.length}
              >
                Exporteren
              </Button>
            </Box>
          </Paper>
        </Grid>

        {metrics && (
          <>
            {/* Metrics Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Totaal Backlinks
                  </Typography>
                  <Typography variant="h4">{metrics.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Actieve Backlinks
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {metrics.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Verloren Backlinks
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {metrics.lost}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Gem. Domain Rating
                  </Typography>
                  <Typography variant="h4">
                    {metrics.avgDomainRating}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Backlink Overzicht
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Backlinks Table */}
            <Grid item xs={12}>
              <Paper>
                <Box p={2} display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">Backlinks</Typography>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      label="Status"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="all">Alle</MenuItem>
                      <MenuItem value="active">Actief</MenuItem>
                      <MenuItem value="lost">Verloren</MenuItem>
                      <MenuItem value="new">Nieuw</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>URL</TableCell>
                        <TableCell>Anchor Text</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Domain Rating</TableCell>
                        <TableCell align="center">DoFollow</TableCell>
                        <TableCell>Laatst Gezien</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {backlinks.map((backlink) => (
                        <TableRow key={backlink._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinkIcon fontSize="small" />
                              <Typography variant="body2" noWrap>
                                {backlink.url}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{backlink.anchorText}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={backlink.status}
                              color={statusColors[backlink.status]}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {backlink.domainRating}
                          </TableCell>
                          <TableCell align="center">
                            {backlink.doFollow ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <WarningIcon color="warning" />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(backlink.lastSeen).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={metrics.total}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default BacklinkMonitor;
