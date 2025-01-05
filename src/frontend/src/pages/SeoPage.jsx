import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";

function SeoPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        SEO Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              SEO Overview
            </Typography>
            <Typography>
              Manage your SEO campaigns and track your website's search engine
              performance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SeoPage;
