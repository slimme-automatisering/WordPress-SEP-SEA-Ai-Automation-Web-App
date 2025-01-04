import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';

export default function Settings() {
  const [settings, setSettings] = useState({
    wordpressUrl: '',
    wordpressApiKey: '',
    googleAdsId: '',
    emailNotifications: true,
    automaticOptimization: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setAlert({
          type: 'error',
          message: 'Er is een fout opgetreden bij het ophalen van de instellingen'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Instellingen succesvol opgeslagen'
        });
      } else {
        throw new Error('Fout bij opslaan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({
        type: 'error',
        message: 'Er is een fout opgetreden bij het opslaan van de instellingen'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Instellingen
      </Typography>

      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                WordPress Integratie
              </Typography>
              <TextField
                fullWidth
                label="WordPress URL"
                name="wordpressUrl"
                value={settings.wordpressUrl}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="WordPress API Key"
                name="wordpressApiKey"
                value={settings.wordpressApiKey}
                onChange={handleChange}
                margin="normal"
                type="password"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Google Ads Integratie
              </Typography>
              <TextField
                fullWidth
                label="Google Ads ID"
                name="googleAdsId"
                value={settings.googleAdsId}
                onChange={handleChange}
                margin="normal"
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Algemene Instellingen
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    name="emailNotifications"
                  />
                }
                label="Email Notificaties"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.automaticOptimization}
                    onChange={handleChange}
                    name="automaticOptimization"
                  />
                }
                label="Automatische Optimalisatie"
              />
            </Paper>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? 'Opslaan...' : 'Instellingen Opslaan'}
          {saving && <CircularProgress size={24} sx={{ ml: 1 }} />}
        </Button>
      </form>
    </div>
  );
}
