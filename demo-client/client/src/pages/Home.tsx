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
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'primary' }} />,
      title: 'Speed up development cycles with federated event API infrastructure',
      description: 'Build self-serve, paved roads for provisioning event API infrastructure. Developers can then expose event streams as event APIs — all governed by automated guardrails defined by the platform team.',
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 48, color: 'primary' }} />,
      title: 'Strengthen your EDA security posture',
      description: 'Enforce encryption and advanced authorization policies for secure, consistent event production and consumption.',
    },
    {
      icon: <ApiIcon sx={{ fontSize: 48, color: 'primary' }} />,
      title: 'Drive real-time innovation with self-service event API products',
      description: 'Publish event streams as secure, self-serve data products (as HTTP APIs or Kafka services) so developers, partners, and customers can discover and build on them.',
    },
  ];

  if (authState?.isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8, background: 'var(--kong-dark-green)', borderRadius: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              color: 'var(--kong-electric-lime)',
              fontWeight: 700,
              fontFamily: 'var(--kong-font-primary)',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 16px #000F06',
            }}
          >
            Welcome Back! 🎉
          </Typography>
          <Typography
            variant="h5"
            paragraph
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              color: 'var(--kong-bay)',
              fontFamily: 'var(--kong-font-primary)',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
            }}
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
                backgroundColor: 'var(--kong-electric-lime)',
                color: 'var(--kong-dark-green)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-button)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: '0 2px 8px #000F06',
                '&:hover': {
                  backgroundColor: '#e6ff4d',
                  color: '#000F06',
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
                borderColor: 'var(--kong-electric-lime)',
                color: 'var(--kong-electric-lime)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-button)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#e6ff4d',
                  color: '#000F06',
                  backgroundColor: 'rgba(204,255,0,0.08)',
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
          background: `repeating-linear-gradient(90deg, var(--kong-dark-green) 0 2px, transparent 2px 40px), repeating-linear-gradient(180deg, var(--kong-dark-green) 0 2px, transparent 2px 40px), var(--kong-dark-green)`,
          color: 'var(--kong-electric-lime)',
          py: { xs: 8, md: 12 },
          mb: 0,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.1,
                fontFamily: 'var(--kong-font-primary)',
                color: 'var(--kong-electric-lime)',
                textShadow: '0 2px 16px #000F06',
              }}
            >
              Unify the event streaming and API developer experience
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                opacity: 0.95,
                fontSize: { xs: '1.25rem', md: '2rem' },
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 700,
                mx: 'auto',
                color: 'var(--kong-bay)',
                fontFamily: 'var(--kong-font-primary)',
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
                  backgroundColor: 'var(--kong-electric-lime)',
                  color: 'var(--kong-dark-green)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  fontFamily: 'var(--kong-font-button)',
                  boxShadow: '0 2px 8px #000F06',
                  '&:hover': {
                    backgroundColor: '#e6ff4d',
                    color: '#000F06',
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
                  borderColor: 'var(--kong-electric-lime)',
                  color: 'var(--kong-electric-lime)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  borderWidth: 2,
                  fontFamily: 'var(--kong-font-button)',
                  '&:hover': {
                    borderColor: '#e6ff4d',
                    color: '#000F06',
                    backgroundColor: 'rgba(204,255,0,0.08)',
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

      {/* Features Section - Kong Brand */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: 'var(--kong-dark-green)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                color: 'var(--kong-electric-lime)',
                fontWeight: 700,
                fontFamily: 'var(--kong-font-primary)',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                textShadow: '0 2px 16px #000F06',
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
                    backgroundColor: 'var(--kong-gray-900)',
                    border: '1px solid var(--kong-bay)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(204,255,0,0.10)',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      color: 'var(--kong-electric-lime)',
                      fontWeight: 600,
                      mb: 2,
                      lineHeight: 1.3,
                      fontFamily: 'var(--kong-font-primary)',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'var(--kong-bay)',
                      lineHeight: 1.6,
                      fontFamily: 'var(--kong-font-primary)',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section - Kong Brand */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: 'var(--kong-dark-green)',
          color: 'var(--kong-electric-lime)',
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
                color: 'var(--kong-electric-lime)',
                fontFamily: 'var(--kong-font-primary)',
                textShadow: '0 2px 16px #000F06',
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
                  backgroundColor: 'var(--kong-electric-lime)',
                  color: 'var(--kong-dark-green)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  fontFamily: 'var(--kong-font-button)',
                  boxShadow: '0 2px 8px #000F06',
                  '&:hover': {
                    backgroundColor: '#e6ff4d',
                    color: '#000F06',
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
                  borderColor: 'var(--kong-electric-lime)',
                  color: 'var(--kong-electric-lime)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  borderWidth: 2,
                  fontFamily: 'var(--kong-font-button)',
                  '&:hover': {
                    borderColor: '#e6ff4d',
                    color: '#000F06',
                    backgroundColor: 'rgba(204,255,0,0.08)',
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
