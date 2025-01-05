import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Line } from "react-chartjs-2";

const difficultyColor = (score) => {
  if (score < 30) return "success";
  if (score < 60) return "warning";
  return "error";
};

const KeywordResearch = () => {
  const theme = useTheme();
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");

  const analyzeKeywords = async () => {
    if (!keywords.trim()) {
      setError("Voer minimaal één keyword in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/keywords/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: keywords
            .split("\n")
            .map((k) => k.trim())
            .filter((k) => k),
        }),
      });

      if (!response.ok) {
        throw new Error("Keyword analyse mislukt");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!results) return;

    try {
      const response = await fetch("/api/keywords/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: results,
          format: exportFormat,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keyword-analysis-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Export mislukt");
    }
  };

  const chartData = results
    ? {
        labels: results.map((r) => r.keyword),
        datasets: [
          {
            label: "Zoekvolume",
            data: results.map((r) => r.search_volume),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            fill: true,
          },
          {
            label: "Moeilijkheid",
            data: results.map((r) => r.difficulty),
            borderColor: theme.palette.secondary.main,
            backgroundColor: theme.palette.secondary.light,
            fill: true,
          },
        ],
      }
    : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Keyword Research
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Keywords Analyseren
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Voer keywords in (één per regel)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SearchIcon />
                }
                onClick={analyzeKeywords}
                disabled={loading}
              >
                Analyseren
              </Button>
              <TextField
                select
                label="Export Formaat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </TextField>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportData}
                disabled={!results}
              >
                Exporteren
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Overview Cards */}
        {results && (
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Totaal Keywords
                    </Typography>
                    <Typography variant="h5">{results.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Gem. Zoekvolume
                    </Typography>
                    <Typography variant="h5">
                      {Math.round(
                        results.reduce((acc, r) => acc + r.search_volume, 0) /
                          results.length,
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Results Table */}
        {results && (
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell align="right">Zoekvolume</TableCell>
                    <TableCell align="right">Moeilijkheid</TableCell>
                    <TableCell>Gerelateerde Keywords</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.keyword}>
                      <TableCell>{result.keyword}</TableCell>
                      <TableCell align="right">
                        {result.search_volume}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${result.difficulty}%`}
                          color={difficultyColor(result.difficulty)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {result.related_keywords.slice(0, 3).map((kw, i) => (
                            <Chip
                              key={i}
                              label={kw}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {/* Chart */}
        {chartData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Keyword Analyse Overzicht
              </Typography>
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
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default KeywordResearch;
