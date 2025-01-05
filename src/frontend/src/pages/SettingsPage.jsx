import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";

function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Settings
            </Typography>
            <Typography>
              Configure your application settings and preferences.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SettingsPage;
