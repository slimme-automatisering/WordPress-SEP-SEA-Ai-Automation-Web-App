import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Tooltip,
  Link
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const statusColors = {
  200: 'success',
  404: 'error',
  301: 'warning',
  302: 'warning'
};

const statusText = {
  200: 'OK',
  404: 'Niet gevonden',
  301: 'Permanent redirect',
  302: 'Tijdelijke redirect'
};

const SitemapGenerator = () => {
  const [domain, setDomain] = useState('');
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [crawlEnabled, setCrawlEnabled] = useState(true);
  const [sitemapUrl, setSitemapUrl] = useState(null);

  const generateSitemap = async () => {
    if (!domain) {
      setError('Voer een domein in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          crawl: crawlEnabled
        }),
      });

      if (!response.ok) {
        throw new Error('Sitemap generatie mislukt');
      }

      // De response is de sitemap XML
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setSitemapUrl(url);

      // Haal direct de URLs en stats op
      await fetchUrls();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await fetch(`/api/sitemap/${domain}/urls?page=${page + 1}&limit=${rowsPerPage}`);
      
      if (!response.ok) {
        throw new Error('Kon URLs niet ophalen');
      }

      const data = await response.json();
      setUrls(data.urls);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/sitemap/${domain}/stats`);
      
      if (!response.ok) {
        throw new Error('Kon statistieken niet ophalen');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (domain) {
      fetchUrls();
    }
  }, [page, rowsPerPage]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sitemap Generator
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
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                fullWidth
                label="Domein"
                variant="outlined"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={crawlEnabled}
                    onChange={(e) => setCrawlEnabled(e.target.checked)}
                  />
                }
                label="Eerst crawlen"
              />
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={generateSitemap}
                disabled={loading}
              >
                Genereren
              </Button>
              {sitemapUrl && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  href={sitemapUrl}
                  download={`sitemap-${domain}.xml`}
                >
                  Download Sitemap
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {stats && (
          <>
            {/* Stats Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Totaal URLs
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Werkende URLs
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.ok}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Gebroken URLs
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.broken}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Laatste Crawl
                  </Typography>
                  <Typography variant="h6">
                    {stats.lastCrawled ? new Date(stats.lastCrawled).toLocaleString() : 'Nooit'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* URLs Table */}
            <Grid item xs={12}>
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>URL</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>Laatste Wijziging</TableCell>
                        <TableCell align="center">Prioriteit</TableCell>
                        <TableCell>Update Frequentie</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {urls.map((url) => (
                        <TableRow key={url._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinkIcon fontSize="small" />
                              <Link href={url.url} target="_blank" rel="noopener">
                                {url.url}
                              </Link>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${url.status} ${statusText[url.status] || ''}`}
                              color={statusColors[url.status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(url.lastmod).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={url.priority}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {url.changefreq}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={stats.total}
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

export default SitemapGenerator;
