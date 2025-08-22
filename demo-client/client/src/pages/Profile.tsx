import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useOktaAuth } from '@okta/okta-react';
import { ProfileProps, UserInfo, TokenClaims } from '../types';

const Profile: React.FC<ProfileProps> = () => {
  const { authState, oktaAuth } = useOktaAuth();
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
      setError(null);
      const user = await oktaAuth.getUser();
      setUserInfo(user);
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
        <Typography variant="body1" color="text.secondary">
          Please log in to view your profile.
        </Typography>
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            👤 User Profile
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your Okta authentication details and token information
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUserInfo}
          disabled={loading}
        >
          Refresh Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Information Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>
                  <AccountCircleIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {userInfo?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userInfo?.email || 'No email available'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {userInfo?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {userInfo?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">
                      {userInfo?.preferred_username || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Subject ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {userInfo?.sub || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Authentication Status Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Authentication Status
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Authentication State
                  </Typography>
                  <Chip
                    label="Authenticated"
                    color="success"
                    icon={<SecurityIcon />}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Token Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  </Box>
                </Box>
                
                {accessTokenClaims?.exp && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Token Expiration
                    </Typography>
                    <Typography variant="body2">
                      {new Date(accessTokenClaims.exp * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                {accessTokenClaims?.iss && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Token Issuer
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {accessTokenClaims.iss}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Token Claims Cards */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Access Token Claims
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 300,
              }}>
                <pre>{JSON.stringify(accessTokenClaims, null, 2)}</pre>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ID Token Claims
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 300,
              }}>
                <pre>{JSON.stringify(idTokenClaims, null, 2)}</pre>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
