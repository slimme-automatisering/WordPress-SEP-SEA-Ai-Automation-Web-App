import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";

export default function Seo() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seo/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setAuditResults(data);
    } catch (error) {
      console.error("Error during audit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        SEO Tools
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Site Audit
            </Typography>
            <TextField
              fullWidth
              label="Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAudit}
              disabled={loading || !url}
            >
              Start Audit
              {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>

            {auditResults && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6">Audit Resultaten</Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Meta Tags"
                        secondary={
                          auditResults.metaTagsScore || "Nog niet gecontroleerd"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Content Kwaliteit"
                        secondary={
                          auditResults.contentScore || "Nog niet gecontroleerd"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Laadsnelheid"
                        secondary={
                          auditResults.speedScore || "Nog niet gecontroleerd"
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Download Rapport
                  </Button>
                </CardActions>
              </Card>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Keyword Analyse
            </Typography>
            {/* Keyword analyse tool hier */}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
