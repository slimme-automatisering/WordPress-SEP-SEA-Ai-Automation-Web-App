import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount / 1000000); // Convert from micros
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('nl-NL');
};

const CampaignList = ({ accountId, onError }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'ENABLED',
    budget: '',
    channelType: 'SEARCH',
    startDate: '',
    endDate: ''
  });

  const fetchCampaigns = async () => {
    if (!accountId) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/campaigns`);
      
      if (!response.ok) {
        throw new Error('Kon campagnes niet ophalen');
      }

      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [accountId]);

  const handleCreate = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Kon campagne niet aanmaken');
      }

      await fetchCampaigns();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCampaign) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/campaigns/${selectedCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Kon campagne niet bijwerken');
      }

      await fetchCampaigns();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Weet je zeker dat je deze campagne wilt verwijderen?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Kon campagne niet verwijderen');
      }

      await fetchCampaigns();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      status: 'ENABLED',
      budget: '',
      channelType: 'SEARCH',
      startDate: '',
      endDate: ''
    });
    setSelectedCampaign(null);
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      status: campaign.status,
      budget: campaign.budget_amount_micros,
      channelType: campaign.advertising_channel_type,
      startDate: campaign.start_date,
      endDate: campaign.end_date || ''
    });
    setOpenDialog(true);
  };

  if (loading && !campaigns.length) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Nieuwe Campagne
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naam</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Start Datum</TableCell>
              <TableCell>Eind Datum</TableCell>
              <TableCell align="right">Impressies</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell align="right">Kosten</TableCell>
              <TableCell align="right">Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>
                  <Chip
                    label={campaign.status}
                    color={campaign.status === 'ENABLED' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(campaign.budget_amount_micros)}
                </TableCell>
                <TableCell>{formatDate(campaign.start_date)}</TableCell>
                <TableCell>
                  {campaign.end_date ? formatDate(campaign.end_date) : '-'}
                </TableCell>
                <TableCell align="right">
                  {campaign.metrics.impressions.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {campaign.metrics.clicks.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(campaign.metrics.cost_micros)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(campaign)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(campaign.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCampaign ? 'Campagne Bewerken' : 'Nieuwe Campagne'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Naam"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="ENABLED">Actief</MenuItem>
                <MenuItem value="PAUSED">Gepauzeerd</MenuItem>
                <MenuItem value="REMOVED">Verwijderd</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Budget (€)"
              type="number"
              value={formData.budget / 1000000}
              onChange={(e) => setFormData({
                ...formData,
                budget: Math.round(parseFloat(e.target.value) * 1000000)
              })}
              fullWidth
              InputProps={{
                startAdornment: '€'
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Campagne Type</InputLabel>
              <Select
                value={formData.channelType}
                onChange={(e) => setFormData({ ...formData, channelType: e.target.value })}
                label="Campagne Type"
              >
                <MenuItem value="SEARCH">Zoeken</MenuItem>
                <MenuItem value="DISPLAY">Display</MenuItem>
                <MenuItem value="SHOPPING">Shopping</MenuItem>
                <MenuItem value="VIDEO">Video</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Datum"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Eind Datum"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Annuleren
          </Button>
          <Button
            variant="contained"
            onClick={selectedCampaign ? handleUpdate : handleCreate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Opslaan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignList;
