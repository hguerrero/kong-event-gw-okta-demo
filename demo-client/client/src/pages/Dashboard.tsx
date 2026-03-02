import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Topic as TopicIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Token as TokenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate } from 'react-router-dom';
import { DashboardProps, UserInfo, TokenClaims } from '../types';

const Dashboard: React.FC<DashboardProps> = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState?.isAuthenticated) {
      fetchUserInfo();
    }
  }, [authState]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const user = await oktaAuth.getUser();
      setUserInfo(user);
      setError(null);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to fetch user information');
    } finally {
      setLoading(false);
    }
  };

  const formatTokenClaims = (token?: string): TokenClaims | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload as TokenClaims;
    } catch (err) {
      return null;
    }
  };

  if (!authState?.isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please log in to access the dashboard.
        </Typography>
        <Button
          variant="contained"
          onClick={() => oktaAuth.signInWithRedirect()}
        >
          Login with Okta
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const accessToken = authState.accessToken?.accessToken;
  const idToken = authState.idToken?.idToken;
  const accessTokenClaims = formatTokenClaims(accessToken);
  const idTokenClaims = formatTokenClaims(idToken);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: 'var(--kong-electric-lime)',
            fontFamily: 'var(--kong-font-primary)',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '0 2px 16px #000F06',
          }}
        >
          🎉 Welcome to Your Dashboard
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'var(--kong-bay)',
            fontFamily: 'var(--kong-font-primary)',
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.5rem' },
          }}
        >
          You're successfully authenticated with Okta OIDC
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<TopicIcon />}
              onClick={() => navigate('/kafka/topics')}
              sx={{
                py: 2,
                backgroundColor: 'var(--kong-electric-lime)',
                color: 'var(--kong-dark-green)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-button)',
                '&:hover': {
                  backgroundColor: '#e6ff4d',
                  color: '#000F06',
                },
              }}
            >
              Browse Kafka Topics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                py: 2,
                borderColor: 'var(--kong-electric-lime)',
                color: 'var(--kong-electric-lime)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-button)',
                '&:hover': {
                  borderColor: '#e6ff4d',
                  color: '#000F06',
                  backgroundColor: 'rgba(204,255,0,0.08)',
                },
              }}
            >
              View Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={fetchUserInfo}
              sx={{
                py: 2,
                borderColor: 'var(--kong-bay)',
                color: 'var(--kong-bay)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-button)',
                '&:hover': {
                  borderColor: '#B7BDB5',
                  color: '#000F06',
                  backgroundColor: 'rgba(183,189,181,0.08)',
                },
              }}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* User Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {userInfo && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {userInfo.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Email:</strong> {userInfo.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Username:</strong> {userInfo.preferred_username || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Subject:</strong> {userInfo.sub || 'N/A'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Authentication Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  label="Authenticated"
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Access Token: ${accessToken ? 'Present' : 'Missing'}`}
                  color={accessToken ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={`ID Token: ${idToken ? 'Present' : 'Missing'}`}
                  color={idToken ? 'success' : 'error'}
                  size="small"
                />
                {accessTokenClaims?.exp && (
                  <Typography variant="caption" color="text.secondary">
                    Token expires: {new Date(accessTokenClaims.exp * 1000).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Token Information */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Token Information
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <TokenIcon sx={{ mr: 1 }} />
            <Typography>Access Token Claims</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ 
              color: "text.secondary",
              p: 2, 
              borderRadius: 1, 
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
            }}>
              <pre>{JSON.stringify(accessTokenClaims, null, 2)}</pre>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <TokenIcon sx={{ mr: 1 }} />
            <Typography>ID Token Claims</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ 
              color: "text.secondary",
              p: 2, 
              borderRadius: 1, 
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
            }}>
              <pre>{JSON.stringify(idTokenClaims, null, 2)}</pre>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Dashboard;
