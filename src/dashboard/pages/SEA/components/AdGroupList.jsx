import React, { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 1000000); // Convert from micros
};

const AdGroupList = ({ accountId, campaignId, onError }) => {
  const [adGroups, setAdGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdGroup, setSelectedAdGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
  });

  const fetchAdGroups = async () => {
    if (!accountId || !campaignId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/campaigns/${campaignId}/adgroups`,
      );

      if (!response.ok) {
        throw new Error("Kon advertentiegroepen niet ophalen");
      }

      const data = await response.json();
      setAdGroups(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdGroups();
  }, [accountId, campaignId]);

  const handleCreate = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/campaigns/${campaignId}/adgroups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon advertentiegroep niet aanmaken");
      }

      await fetchAdGroups();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAdGroup) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/adgroups/${selectedAdGroup.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon advertentiegroep niet bijwerken");
      }

      await fetchAdGroups();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adGroupId) => {
    if (
      !window.confirm(
        "Weet je zeker dat je deze advertentiegroep wilt verwijderen?",
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/adgroups/${adGroupId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Kon advertentiegroep niet verwijderen");
      }

      await fetchAdGroups();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      status: "ENABLED",
      type: "SEARCH_STANDARD",
    });
    setSelectedAdGroup(null);
  };

  const handleEdit = (adGroup) => {
    setSelectedAdGroup(adGroup);
    setFormData({
      name: adGroup.name,
      status: adGroup.status,
      type: adGroup.type,
    });
    setOpenDialog(true);
  };

  if (loading && !adGroups.length) {
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
          Nieuwe Advertentiegroep
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naam</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Impressies</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell align="right">Kosten</TableCell>
              <TableCell align="right">Conversies</TableCell>
              <TableCell align="right">Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adGroups.map((adGroup) => (
              <TableRow key={adGroup.id}>
                <TableCell>{adGroup.name}</TableCell>
                <TableCell>
                  <Chip
                    label={adGroup.status}
                    color={adGroup.status === "ENABLED" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{adGroup.type}</TableCell>
                <TableCell align="right">
                  {adGroup.metrics.impressions.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {adGroup.metrics.clicks.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(adGroup.metrics.cost_micros)}
                </TableCell>
                <TableCell align="right">
                  {adGroup.metrics.conversions.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(adGroup)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(adGroup.id)}
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
          {selectedAdGroup
            ? "Advertentiegroep Bewerken"
            : "Nieuwe Advertentiegroep"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Naam"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="Status"
              >
                <MenuItem value="ENABLED">Actief</MenuItem>
                <MenuItem value="PAUSED">Gepauzeerd</MenuItem>
                <MenuItem value="REMOVED">Verwijderd</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                label="Type"
              >
                <MenuItem value="SEARCH_STANDARD">Zoeken - Standaard</MenuItem>
                <MenuItem value="DISPLAY_STANDARD">
                  Display - Standaard
                </MenuItem>
                <MenuItem value="SHOPPING_PRODUCT_ADS">
                  Shopping - Product
                </MenuItem>
                <MenuItem value="VIDEO_STANDARD">Video - Standaard</MenuItem>
              </Select>
            </FormControl>
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
            onClick={selectedAdGroup ? handleUpdate : handleCreate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Opslaan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdGroupList;
