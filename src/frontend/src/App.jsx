import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SeoPage from './pages/SeoPage';
import SeaPage from './pages/SeaPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WooCommercePage from './pages/WooCommercePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: 30 },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/seo" element={<SeoPage />} />
          <Route path="/sea" element={<SeaPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/woocommerce" element={<WooCommercePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
