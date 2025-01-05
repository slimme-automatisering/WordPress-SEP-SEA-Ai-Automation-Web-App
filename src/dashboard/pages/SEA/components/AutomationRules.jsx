import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

const AutomationRules = ({ accountId }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    conditions: [
      {
        metric: "CPC",
        operator: "GREATER_THAN",
        value: "",
      },
    ],
    actions: [
      {
        type: "ADJUST_BUDGET",
        value: "",
      },
    ],
    schedule: {
      frequency: "DAILY",
      time: "09:00",
      daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    },
  });

  const fetchRules = async () => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/automation/rules`,
      );

      if (!response.ok) {
        throw new Error("Kon automatiseringsregels niet ophalen");
      }

      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [accountId]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/automation/rules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Kon automatiseringsregel niet aanmaken");
      }

      await fetchRules();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunRule = async (ruleId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads/${accountId}/automation/rules/${ruleId}/execute`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Kon automatiseringsregel niet uitvoeren");
      }

      // Toon success message
      alert("Regel succesvol uitgevoerd");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      conditions: [
        {
          metric: "CPC",
          operator: "GREATER_THAN",
          value: "",
        },
      ],
      actions: [
        {
          type: "ADJUST_BUDGET",
          value: "",
        },
      ],
      schedule: {
        frequency: "DAILY",
        time: "09:00",
        daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      },
    });
    setSelectedRule(null);
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        {
          metric: "CPC",
          operator: "GREATER_THAN",
          value: "",
        },
      ],
    });
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        {
          type: "ADJUST_BUDGET",
          value: "",
        },
      ],
    });
  };

  if (loading && !rules.length) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Automatiseringsregels</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Nieuwe Regel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Rules List */}
      <Grid container spacing={3}>
        {rules.map((rule) => (
          <Grid item xs={12} key={rule._id}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">{rule.name}</Typography>
                  <Box>
                    <IconButton
                      onClick={() => handleRunRule(rule._id)}
                      size="small"
                      color="primary"
                    >
                      <RunIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedRule(rule);
                        setFormData({
                          name: rule.name,
                          conditions: rule.conditions,
                          actions: rule.actions,
                          schedule: rule.schedule,
                        });
                        setOpenDialog(true);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Voorwaarden</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {rule.conditions.map((condition, index) => (
                      <Typography key={index}>
                        {condition.metric} {condition.operator}{" "}
                        {condition.value}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Acties</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {rule.actions.map((action, index) => (
                      <Typography key={index}>
                        {action.type}: {action.value}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>

                <Box mt={2} display="flex" alignItems="center">
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {rule.schedule.frequency} om {rule.schedule.time}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
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
          {selectedRule ? "Regel Bewerken" : "Nieuwe Regel"}
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

            {/* Conditions */}
            <Typography variant="h6" gutterBottom>
              Voorwaarden
            </Typography>
            {formData.conditions.map((condition, index) => (
              <Box key={index} display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={condition.metric}
                    onChange={(e) => {
                      const newConditions = [...formData.conditions];
                      newConditions[index].metric = e.target.value;
                      setFormData({ ...formData, conditions: newConditions });
                    }}
                    label="Metric"
                  >
                    <MenuItem value="CPC">CPC</MenuItem>
                    <MenuItem value="CTR">CTR</MenuItem>
                    <MenuItem value="CONVERSIONS">Conversies</MenuItem>
                    <MenuItem value="COST">Kosten</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={condition.operator}
                    onChange={(e) => {
                      const newConditions = [...formData.conditions];
                      newConditions[index].operator = e.target.value;
                      setFormData({ ...formData, conditions: newConditions });
                    }}
                    label="Operator"
                  >
                    <MenuItem value="GREATER_THAN">Groter dan</MenuItem>
                    <MenuItem value="LESS_THAN">Kleiner dan</MenuItem>
                    <MenuItem value="EQUALS">Gelijk aan</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Waarde"
                  value={condition.value}
                  onChange={(e) => {
                    const newConditions = [...formData.conditions];
                    newConditions[index].value = e.target.value;
                    setFormData({ ...formData, conditions: newConditions });
                  }}
                  fullWidth
                />
              </Box>
            ))}
            <Button onClick={addCondition}>Voorwaarde Toevoegen</Button>

            {/* Actions */}
            <Typography variant="h6" gutterBottom>
              Acties
            </Typography>
            {formData.actions.map((action, index) => (
              <Box key={index} display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={action.type}
                    onChange={(e) => {
                      const newActions = [...formData.actions];
                      newActions[index].type = e.target.value;
                      setFormData({ ...formData, actions: newActions });
                    }}
                    label="Type"
                  >
                    <MenuItem value="ADJUST_BUDGET">Budget Aanpassen</MenuItem>
                    <MenuItem value="ADJUST_BID">Bod Aanpassen</MenuItem>
                    <MenuItem value="PAUSE_CAMPAIGN">
                      Campagne Pauzeren
                    </MenuItem>
                    <MenuItem value="ENABLE_CAMPAIGN">
                      Campagne Activeren
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Waarde"
                  value={action.value}
                  onChange={(e) => {
                    const newActions = [...formData.actions];
                    newActions[index].value = e.target.value;
                    setFormData({ ...formData, actions: newActions });
                  }}
                  fullWidth
                />
              </Box>
            ))}
            <Button onClick={addAction}>Actie Toevoegen</Button>

            {/* Schedule */}
            <Typography variant="h6" gutterBottom>
              Planning
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Frequentie</InputLabel>
              <Select
                value={formData.schedule.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule: {
                      ...formData.schedule,
                      frequency: e.target.value,
                    },
                  })
                }
                label="Frequentie"
              >
                <MenuItem value="HOURLY">Elk uur</MenuItem>
                <MenuItem value="DAILY">Dagelijks</MenuItem>
                <MenuItem value="WEEKLY">Wekelijks</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Tijd"
              type="time"
              value={formData.schedule.time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, time: e.target.value },
                })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            {formData.schedule.frequency === "WEEKLY" && (
              <FormGroup>
                {[
                  "MONDAY",
                  "TUESDAY",
                  "WEDNESDAY",
                  "THURSDAY",
                  "FRIDAY",
                  "SATURDAY",
                  "SUNDAY",
                ].map((day) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Switch
                        checked={formData.schedule.daysOfWeek.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...formData.schedule.daysOfWeek, day]
                            : formData.schedule.daysOfWeek.filter(
                                (d) => d !== day,
                              );
                          setFormData({
                            ...formData,
                            schedule: {
                              ...formData.schedule,
                              daysOfWeek: newDays,
                            },
                          });
                        }}
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>
            )}
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
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Opslaan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationRules;
