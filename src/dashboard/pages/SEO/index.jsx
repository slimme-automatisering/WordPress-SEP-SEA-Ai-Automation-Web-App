import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Link as LinkIcon,
  SiteMap as SiteMapIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import KeywordResearch from './KeywordResearch';
import SEOAnalyzer from './SEOAnalyzer';
import BacklinkMonitor from './BacklinkMonitor';
import SitemapGenerator from './SitemapGenerator';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`seo-tabpanel-${index}`}
      aria-labelledby={`seo-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SEODashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        SEO Dashboard
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<SearchIcon />} label="Keyword Research" />
          <Tab icon={<TrendingUpIcon />} label="SEO Analyse" />
          <Tab icon={<LinkIcon />} label="Backlinks" />
          <Tab icon={<SiteMapIcon />} label="Sitemap" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <KeywordResearch />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <SEOAnalyzer />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <BacklinkMonitor />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <SitemapGenerator />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SEODashboard;
