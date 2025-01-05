import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function Dashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1">
            Welcome to the SEO/SEA Automation Dashboard. Here you can monitor
            your campaigns and analytics.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
