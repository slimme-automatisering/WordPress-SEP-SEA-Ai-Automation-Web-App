import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function Campaigns() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Campaigns
          </Typography>
          <Typography variant="body1">
            Manage your SEO and SEA campaigns here.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Campaigns;
