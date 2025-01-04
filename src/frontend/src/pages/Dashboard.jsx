import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import {
  Search as SearchIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import StatCard from '../components/StatCard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registreer Chart.js componenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Voorbeeld data voor de grafieken
const trafficData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Organisch Verkeer',
      data: [1200, 1900, 3000, 5000, 4000, 6000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Betaald Verkeer',
      data: [1000, 2000, 2500, 3500, 3000, 4500],
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Website Verkeer',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SEO Score"
            value="85/100"
            change={5}
            icon={SearchIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SEA ROI"
            value="250%"
            change={12}
            icon={CampaignIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bezoekers"
            value="12.5K"
            change={-3}
            icon={AnalyticsIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Omzet"
            value="€8.2K"
            change={8}
            icon={ShoppingCartIcon}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: 3,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Line options={options} data={trafficData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
