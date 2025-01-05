import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Campaign as CampaignIcon,
  Group as GroupIcon,
  Ads as AdsIcon,
} from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";

// Componenten
import CampaignList from "./components/CampaignList";
import AdGroupList from "./components/AdGroupList";
import AdList from "./components/AdList";
import MetricsOverview from "./components/MetricsOverview";
import CampaignForm from "./components/CampaignForm";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`google-ads-tabpanel-${index}`}
      aria-labelledby={`google-ads-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const GoogleAds = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Account connectie states
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [developerToken, setDeveloperToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loginCustomerId, setLoginCustomerId] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/google-ads/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          developerToken,
          refreshToken,
          loginCustomerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Verbinding mislukt");
      }

      const data = await response.json();
      setAccounts([...accounts, { loginCustomerId }]);
      setSelectedAccount(loginCustomerId);
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Google Ads Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Account Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Google Ads Account</InputLabel>
                <Select
                  value={selectedAccount || ""}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  label="Google Ads Account"
                >
                  <MenuItem value="">
                    <em>Selecteer een account</em>
                  </MenuItem>
                  {accounts.map((account) => (
                    <MenuItem
                      key={account.loginCustomerId}
                      value={account.loginCustomerId}
                    >
                      {account.loginCustomerId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType("connect");
                  setOpenDialog(true);
                }}
              >
                Account Toevoegen
              </Button>
            </Box>
          </Paper>
        </Grid>

        {selectedAccount && (
          <>
            {/* Metrics Overview */}
            <Grid item xs={12}>
              <MetricsOverview
                accountId={selectedAccount}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </Grid>

            {/* Main Content */}
            <Grid item xs={12}>
              <Paper>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab icon={<CampaignIcon />} label="Campagnes" />
                  <Tab icon={<GroupIcon />} label="Advertentiegroepen" />
                  <Tab icon={<AdsIcon />} label="Advertenties" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <CampaignList
                    accountId={selectedAccount}
                    onError={setError}
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <AdGroupList accountId={selectedAccount} onError={setError} />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <AdList accountId={selectedAccount} onError={setError} />
                </TabPanel>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* Connect Dialog */}
      <Dialog
        open={openDialog && dialogType === "connect"}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Google Ads Account Verbinden</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              fullWidth
            />
            <TextField
              label="Client Secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              fullWidth
            />
            <TextField
              label="Developer Token"
              value={developerToken}
              onChange={(e) => setDeveloperToken(e.target.value)}
              fullWidth
            />
            <TextField
              label="Refresh Token"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              fullWidth
            />
            <TextField
              label="Login Customer ID"
              value={loginCustomerId}
              onChange={(e) => setLoginCustomerId(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuleren</Button>
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Verbinden"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleAds;
