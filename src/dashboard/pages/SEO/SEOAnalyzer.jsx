import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
  Share as ShareIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const scoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
};

const SEOAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzePage = async () => {
    if (!url.trim()) {
      setError('Voer een URL in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Analyse mislukt');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (!analysis) return 0;

    const scores = {
      meta: analysis.metaTags.title && analysis.metaTags.description ? 100 : 50,
      headings: analysis.headings.h1.length === 1 ? 100 : 50,
      images: analysis.images.every(img => img.alt) ? 100 : 50,
      performance: analysis.performance.loadTime < 3000 ? 100 : 50,
      mobile: analysis.mobileOptimized.hasMobileViewport ? 100 : 0
    };

    return Math.round(Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        SEO Analyse
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
                label="Website URL"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <Button
                variant="contained"
                startIcon={loading ? <LinearProgress size={20} /> : <SearchIcon />}
                onClick={analyzePage}
                disabled={loading}
              >
                Analyseren
              </Button>
            </Box>
          </Paper>
        </Grid>

        {analysis && (
          <>
            {/* Overview Score */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Totaalscore
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h3">
                      {calculateOverallScore()}%
                    </Typography>
                    <Chip
                      label={scoreColor(calculateOverallScore()) === 'success' ? 'Goed' : 'Verbetering nodig'}
                      color={scoreColor(calculateOverallScore())}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Stats */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography color="textSecondary" variant="body2">
                        Laadtijd
                      </Typography>
                      <Typography variant="h6">
                        {(analysis.performance.loadTime / 1000).toFixed(2)}s
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography color="textSecondary" variant="body2">
                        DOM Nodes
                      </Typography>
                      <Typography variant="h6">
                        {analysis.performance.domNodes}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography color="textSecondary" variant="body2">
                        JS Heap Size
                      </Typography>
                      <Typography variant="h6">
                        {Math.round(analysis.performance.jsHeapSize / 1024 / 1024)}MB
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography color="textSecondary" variant="body2">
                        Mobile Viewport
                      </Typography>
                      <Typography variant="h6">
                        {analysis.mobileOptimized.hasMobileViewport ? 'Ja' : 'Nee'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Analysis */}
            <Grid item xs={12}>
              <Paper>
                <List>
                  {/* Meta Tags */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Meta Tags"
                        secondary={`${analysis.metaTags.title ? 'Title aanwezig' : 'Title ontbreekt'}, ${analysis.metaTags.description ? 'Description aanwezig' : 'Description ontbreekt'}`}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Title"
                            secondary={analysis.metaTags.title || 'Ontbreekt'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Description"
                            secondary={analysis.metaTags.description || 'Ontbreekt'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Keywords"
                            secondary={analysis.metaTags.keywords || 'Niet gespecificeerd'}
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Headings */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <ShareIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Heading Structuur"
                        secondary={`${analysis.headings.h1.length} H1, ${analysis.headings.h2.length} H2, ${analysis.headings.h3.length} H3`}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {Object.entries(analysis.headings).map(([tag, headings]) => (
                          <ListItem key={tag}>
                            <ListItemText
                              primary={`${tag.toUpperCase()} Tags (${headings.length})`}
                              secondary={headings.join(', ')}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Images */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <ImageIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Afbeeldingen"
                        secondary={`${analysis.images.length} afbeeldingen gevonden`}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {analysis.images.map((img, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={img.alt || 'Geen alt text'}
                              secondary={img.src}
                            />
                            {!img.alt && (
                              <Tooltip title="Alt text ontbreekt">
                                <WarningIcon color="warning" />
                              </Tooltip>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Links */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <LinkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Links"
                        secondary={`${analysis.links.internal.length} interne, ${analysis.links.external.length} externe links`}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>
                            Interne Links
                          </Typography>
                          <List>
                            {analysis.links.internal.map((link, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={link} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>
                            Externe Links
                          </Typography>
                          <List>
                            {analysis.links.external.map((link, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={link} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Mobile Optimization */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Mobile Optimalisatie"
                        secondary={analysis.mobileOptimized.hasMobileViewport ? 'Mobile-friendly' : 'Niet mobile-friendly'}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Viewport Meta Tag"
                            secondary={analysis.mobileOptimized.hasMobileViewport ? 'Aanwezig' : 'Ontbreekt'}
                          />
                          {analysis.mobileOptimized.hasMobileViewport ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
                          )}
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Touch Targets"
                            secondary={`${analysis.mobileOptimized.touchable.smallTouchTargets} van de ${analysis.mobileOptimized.touchable.totalLinks} links zijn te klein`}
                          />
                          {analysis.mobileOptimized.touchable.smallTouchTargets === 0 ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <WarningIcon color="warning" />
                          )}
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </List>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default SEOAnalyzer;
