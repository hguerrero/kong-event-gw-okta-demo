import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Topic as TopicIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate } from 'react-router-dom';
import { kafkaApi } from '../services/api';
import { KafkaTopicsProps } from '../types';

const KafkaTopics: React.FC<KafkaTopicsProps> = () => {
  const { authState } = useOktaAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (authState?.isAuthenticated) {
      fetchTopics();
    }
  }, [authState]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = authState?.accessToken?.accessToken;
      const topicsData = await kafkaApi.getTopics(accessToken!);
      setTopics(topicsData.topics || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
      if (typeof err === 'object' && err !== null) {
        // Try to extract error message from axios error shape
        const errorMsg =
          (err as any).response?.data?.error ||
          (err as any).message ||
          'Failed to fetch topics';
        setError(errorMsg);
      } else {
        setError('Failed to fetch topics');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTopicClick = (topicName: string) => {
    navigate(`/kafka/topics/${encodeURIComponent(topicName)}/messages`);
  };

  if (!authState?.isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please log in to view Kafka topics.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            📋 Kafka Topics
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Topics retrieved through KNEP virtual clusters using your Okta access token
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchTopics}
          disabled={loading}
        >
          Refresh Topics
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={fetchTopics}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Topic Count */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${filteredTopics.length} topics found`}
              color="primary"
              icon={<TopicIcon />}
            />
            {searchTerm && (
              <Chip
                label={`Filtered from ${topics.length} total`}
                variant="outlined"
              />
            )}
          </Box>

          {/* Topics Grid */}
          {filteredTopics.length > 0 ? (
            <Grid container spacing={3}>
              {filteredTopics.map((topic, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea 
                      onClick={() => handleTopicClick(topic)}
                      sx={{ height: '100%', p: 2 }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TopicIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" component="h3" noWrap>
                            {topic}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Click to view messages from this topic
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Chip
                            size="small"
                            label="View Messages"
                            color="primary"
                            icon={<MessageIcon />}
                          />
                          <Typography variant="caption" color="text.secondary">
                            →
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <TopicIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {searchTerm ? 'No topics match your search' : 'No topics found'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all topics.'
                  : 'The Kafka cluster might be empty or you might not have permission to view topics.'
                }
              </Typography>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default KafkaTopics;
