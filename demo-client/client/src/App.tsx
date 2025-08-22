import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl, OktaAuthOptions } from '@okta/okta-auth-js';
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import KafkaTopics from './pages/KafkaTopics';
import TopicMessages from './pages/TopicMessages';
import Profile from './pages/Profile';

const oktaAuthConfig: OktaAuthOptions = {
  issuer: process.env.REACT_APP_OKTA_ISSUER || 'https://your-domain.okta.com',
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID || 'your-client-id',
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  devMode: process.env.NODE_ENV === 'development',
};

const oktaAuth = new OktaAuth(oktaAuthConfig);

const App: React.FC = () => {
  const navigate = useNavigate();

  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri?: string) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <ErrorBoundary>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/kafka/topics" element={<KafkaTopics />} />
              <Route path="/kafka/topics/:topicName/messages" element={<TopicMessages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login/callback" element={<LoginCallback />} />
            </Routes>
          </Container>
        </Box>
      </Security>
    </ErrorBoundary>
  );
}

export default App;
