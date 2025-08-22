import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Topic as TopicIcon,
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate } from 'react-router-dom';
import { HomeProps } from '../types';

const Home: React.FC<HomeProps> = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const navigate = useNavigate();



  interface Feature {
    icon: React.ReactElement;
    title: string;
    description: string;
  }

  const features: Feature[] = [
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: '#00D4AA' }} />,
      title: 'Speed up development cycles with federated event API infrastructure',
      description: 'Build self-serve, paved roads for provisioning event API infrastructure. Developers can then expose event streams as event APIs — all governed by automated guardrails defined by the platform team.',
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 48, color: '#00D4AA' }} />,
      title: 'Strengthen your EDA security posture',
      description: 'Enforce encryption and advanced authorization policies for secure, consistent event production and consumption.',
    },
    {
      icon: <ApiIcon sx={{ fontSize: 48, color: '#00D4AA' }} />,
      title: 'Drive real-time innovation with self-service event API products',
      description: 'Publish event streams as secure, self-serve data products (as HTTP APIs or Kafka services) so developers, partners, and customers can discover and build on them.',
    },
  ];

  if (authState?.isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              color: '#003459',
              fontWeight: 700,
              mb: 3,
            }}
          >
            Welcome Back! 🎉
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            You're successfully authenticated. Ready to explore event streams and Kafka topics?
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                backgroundColor: '#003459',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#001E2B',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<TopicIcon />}
              onClick={() => navigate('/kafka/topics')}
              sx={{
                borderColor: '#003459',
                color: '#003459',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#003459',
                  backgroundColor: 'rgba(0, 52, 89, 0.04)',
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Browse Kafka Topics
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section - Kong Style */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003459 0%, #001E2B 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 0,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Unify the event streaming and API developer experience
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                opacity: 0.9,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Secure, govern, discover, and observe event streams in your API platform.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => oktaAuth.signInWithRedirect()}
                sx={{
                  backgroundColor: '#00D4AA',
                  color: '#000000',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#00A085',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get a Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => oktaAuth.signInWithRedirect()}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#00D4AA',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Sign In with Okta
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label="Kong Event Gateway"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label="Okta OIDC"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label="Kafka Integration"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 500,
                }}
              />
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                color: '#003459',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
              }}
            >
              Drive more ROI from event streams with an EDA-ready API platform
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 52, 89, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      color: '#003459',
                      fontWeight: 600,
                      mb: 2,
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(135deg, #003459 0%, #001E2B 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.75rem' },
              }}
            >
              Get started with Kong Event Gateway
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => oktaAuth.signInWithRedirect()}
                sx={{
                  backgroundColor: '#00D4AA',
                  color: '#000000',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#00A085',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get a Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => oktaAuth.signInWithRedirect()}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#00D4AA',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Early Access
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
