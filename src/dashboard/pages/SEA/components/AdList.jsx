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
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 1000000); // Convert from micros
};

const AdList = ({ accountId, adGroupId, onError }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [formData, setFormData] = useState({
    type: "EXPANDED_TEXT_AD",
    headlinesParts: ["", "", ""],
    descriptions: ["", ""],
    path1: "",
    path2: "",
    finalUrl: "",
  });

  const fetchAds = async () => {
    if (!accountId || !adGroupId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/adgroups/${adGroupId}/ads`,
      );

      if (!response.ok) {
        throw new Error("Kon advertenties niet ophalen");
      }

      const data = await response.json();
      setAds(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [accountId, adGroupId]);

  const handleCreate = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/adgroups/${adGroupId}/ads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon advertentie niet aanmaken");
      }

      await fetchAds();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAd) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/ads/${selectedAd.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon advertentie niet bijwerken");
      }

      await fetchAds();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (
      !window.confirm("Weet je zeker dat je deze advertentie wilt verwijderen?")
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/google-ads/${accountId}/ads/${adId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Kon advertentie niet verwijderen");
      }

      await fetchAds();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "EXPANDED_TEXT_AD",
      headlinesParts: ["", "", ""],
      descriptions: ["", ""],
      path1: "",
      path2: "",
      finalUrl: "",
    });
    setSelectedAd(null);
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setFormData({
      type: ad.type,
      headlinesParts: ad.headlinesParts,
      descriptions: ad.descriptions,
      path1: ad.path1,
      path2: ad.path2,
      finalUrl: ad.finalUrl,
    });
    setOpenDialog(true);
  };

  if (loading && !ads.length) {
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
          Nieuwe Advertentie
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>URL</TableCell>
              <TableCell align="right">Impressies</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell align="right">CTR</TableCell>
              <TableCell align="right">Kosten</TableCell>
              <TableCell align="right">Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.type}</TableCell>
                <TableCell>
                  <Chip
                    label={ad.status}
                    color={ad.status === "ENABLED" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{ad.finalUrl}</TableCell>
                <TableCell align="right">
                  {ad.metrics.impressions.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {ad.metrics.clicks.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {((ad.metrics.clicks / ad.metrics.impressions) * 100).toFixed(
                    2,
                  )}
                  %
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(ad.metrics.cost_micros)}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setPreviewAd(ad)} size="small">
                    <PreviewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(ad)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(ad.id)}
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

      {/* Ad Preview Dialog */}
      <Dialog
        open={Boolean(previewAd)}
        onClose={() => setPreviewAd(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advertentie Voorbeeld</DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {previewAd?.headlinesParts[0]}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {previewAd?.finalUrl}
                </Typography>
                {previewAd?.descriptions.map((desc, index) => (
                  <Typography key={index} variant="body2">
                    {desc}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewAd(null)}>Sluiten</Button>
        </DialogActions>
      </Dialog>

      {/* Ad Edit Dialog */}
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
          {selectedAd ? "Advertentie Bewerken" : "Nieuwe Advertentie"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                label="Type"
              >
                <MenuItem value="EXPANDED_TEXT_AD">
                  Uitgebreide Tekstadvertentie
                </MenuItem>
                <MenuItem value="RESPONSIVE_SEARCH_AD">
                  Responsieve Zoekadvertentie
                </MenuItem>
              </Select>
            </FormControl>

            {/* Headlines */}
            {formData.headlinesParts.map((headline, index) => (
              <TextField
                key={`headline-${index}`}
                label={`Kop ${index + 1}`}
                value={headline}
                onChange={(e) => {
                  const newHeadlines = [...formData.headlinesParts];
                  newHeadlines[index] = e.target.value;
                  setFormData({ ...formData, headlinesParts: newHeadlines });
                }}
                fullWidth
              />
            ))}

            {/* Descriptions */}
            {formData.descriptions.map((description, index) => (
              <TextField
                key={`description-${index}`}
                label={`Beschrijving ${index + 1}`}
                value={description}
                onChange={(e) => {
                  const newDescriptions = [...formData.descriptions];
                  newDescriptions[index] = e.target.value;
                  setFormData({ ...formData, descriptions: newDescriptions });
                }}
                fullWidth
                multiline
                rows={2}
              />
            ))}

            {/* Paths */}
            <Box display="flex" gap={2}>
              <TextField
                label="Pad 1"
                value={formData.path1}
                onChange={(e) =>
                  setFormData({ ...formData, path1: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Pad 2"
                value={formData.path2}
                onChange={(e) =>
                  setFormData({ ...formData, path2: e.target.value })
                }
                fullWidth
              />
            </Box>

            <TextField
              label="Bestemmings-URL"
              value={formData.finalUrl}
              onChange={(e) =>
                setFormData({ ...formData, finalUrl: e.target.value })
              }
              fullWidth
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
            onClick={selectedAd ? handleUpdate : handleCreate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Opslaan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdList;
