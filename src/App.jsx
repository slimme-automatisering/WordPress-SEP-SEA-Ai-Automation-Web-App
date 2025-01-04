import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './dashboard/components/Layout';
import Stats from './dashboard/pages/Stats';
import Seo from './dashboard/pages/Seo';
import Sea from './dashboard/pages/Sea';
import Settings from './dashboard/pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/stats" replace />} />
            <Route path="/dashboard/stats" element={<Stats />} />
            <Route path="/dashboard/seo" element={<Seo />} />
            <Route path="/dashboard/sea" element={<Sea />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
