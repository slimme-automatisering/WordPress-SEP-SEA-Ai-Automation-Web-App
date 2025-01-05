import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";

function SeaPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        SEA Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              SEA Overview
            </Typography>
            <Typography>
              Manage your search engine advertising campaigns and track your ad
              performance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SeaPage;
