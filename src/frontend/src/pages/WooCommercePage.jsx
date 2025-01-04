import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

function WooCommercePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WooCommerce Integration
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              WooCommerce Overview
            </Typography>
            <Typography>
              Manage your WooCommerce integration and synchronize your product data.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WooCommercePage;
