import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { useOktaAuth } from '@okta/okta-react';
import { KafkaConnectionConfig, KafkaConnectionTestResponse } from '../types';
import { kafkaApi } from '../services/api';

const DEFAULT_CONFIG: KafkaConnectionConfig = {
  bootstrapServers: 'localhost:19092',
  ssl: false,
  saslMechanism: 'oauthbearer',
  clientId: 'knep-demo-client'
};

const Settings: React.FC = () => {
  const { authState } = useOktaAuth();
  const [config, setConfig] = useState<KafkaConnectionConfig>(DEFAULT_CONFIG);
  const [testResult, setTestResult] = useState<KafkaConnectionTestResponse | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved configuration from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('kafkaConnectionConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      } catch (error) {
        console.error('Error parsing saved Kafka config:', error);
      }
    }
  }, []);

  const handleConfigChange = (field: keyof KafkaConnectionConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear test result when config changes
    setTestResult(null);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      localStorage.setItem('kafkaConnectionConfig', JSON.stringify(config));
      // Show success message
      setTestResult({
        success: true,
        message: 'Configuration saved successfully!',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!authState?.accessToken?.accessToken) {
      setTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please ensure you are logged in',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await kafkaApi.testConnection(authState.accessToken.accessToken, config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    setTestResult(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kafka Connection Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure your Kafka connection parameters. These settings will be used for all Kafka operations.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {/* Bootstrap Servers */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bootstrap Servers"
              value={config.bootstrapServers}
              onChange={(e) => handleConfigChange('bootstrapServers', e.target.value)}
              placeholder="localhost:19092"
              helperText="Comma-separated list of Kafka broker addresses"
            />
          </Grid>

          {/* Client ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Client ID"
              value={config.clientId || ''}
              onChange={(e) => handleConfigChange('clientId', e.target.value)}
              placeholder="knep-demo-client"
              helperText="Unique identifier for this client"
            />
          </Grid>

          {/* SSL Toggle */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">SSL/TLS</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.ssl}
                    onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                  />
                }
                label={config.ssl ? 'Enabled' : 'Disabled'}
              />
            </FormControl>
          </Grid>

          {/* SASL Mechanism */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">SASL Mechanism</FormLabel>
              <RadioGroup
                row
                value={config.saslMechanism || 'oauthbearer'}
                onChange={(e) => handleConfigChange('saslMechanism', e.target.value)}
              >
                <FormControlLabel value="oauthbearer" control={<Radio />} label="OAuth Bearer" />
                <FormControlLabel value="plain" control={<Radio />} label="PLAIN" />
                <FormControlLabel value="scram-sha-256" control={<Radio />} label="SCRAM-SHA-256" />
                <FormControlLabel value="scram-sha-512" control={<Radio />} label="SCRAM-SHA-512" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Username/Password for non-OAuth mechanisms */}
          {config.saslMechanism !== 'oauthbearer' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={config.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  helperText="SASL username"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={config.password || ''}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  helperText="SASL password"
                />
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testing || !authState?.isAuthenticated}
            startIcon={testing ? <CircularProgress size={20} /> : null}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            variant="text"
            onClick={handleResetToDefaults}
            color="secondary"
          >
            Reset to Defaults
          </Button>
        </Box>

        {/* Test Result */}
        {testResult && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                <strong>{testResult.message}</strong>
                {testResult.error && (
                  <>
                    <br />
                    <small>Error: {testResult.error}</small>
                  </>
                )}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Current Configuration Summary */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`Servers: ${config.bootstrapServers}`} variant="outlined" />
              <Chip label={`SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`} variant="outlined" />
              <Chip label={`SASL: ${config.saslMechanism?.toUpperCase()}`} variant="outlined" />
              {config.clientId && <Chip label={`Client: ${config.clientId}`} variant="outlined" />}
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default Settings;
