import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

function StatCard({ title, value, change, icon: Icon }) {
  const isPositive = change >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Icon color="primary" />
        </Box>

        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPositive ? (
            <TrendingUp color="success" />
          ) : (
            <TrendingDown color="error" />
          )}
          <Typography
            variant="body2"
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {Math.abs(change)}% {isPositive ? 'stijging' : 'daling'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            vs vorige periode
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;
