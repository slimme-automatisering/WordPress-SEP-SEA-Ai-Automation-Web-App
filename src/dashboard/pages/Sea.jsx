import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';

export default function Sea() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/ads/campaigns');
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Google Ads Campagnes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mb: 2 }}
            >
              Nieuwe Campagne
            </Button>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campagne Naam</TableCell>
                    <TableCell align="right">Budget</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Impressies</TableCell>
                    <TableCell align="right">CTR</TableCell>
                    <TableCell align="right">Kosten</TableCell>
                    <TableCell align="right">Conversies</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell component="th" scope="row">
                        {campaign.name}
                      </TableCell>
                      <TableCell align="right">€{campaign.budget}</TableCell>
                      <TableCell align="right">{campaign.clicks}</TableCell>
                      <TableCell align="right">{campaign.impressions}</TableCell>
                      <TableCell align="right">{campaign.ctr}%</TableCell>
                      <TableCell align="right">€{campaign.cost}</TableCell>
                      <TableCell align="right">{campaign.conversions}</TableCell>
                      <TableCell>{campaign.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
