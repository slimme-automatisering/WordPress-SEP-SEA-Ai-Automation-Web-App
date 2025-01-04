import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

function AnalyticsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Analytics
            </Typography>
            <Typography>
              View detailed analytics and insights for your SEO and SEA campaigns.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsPage;
