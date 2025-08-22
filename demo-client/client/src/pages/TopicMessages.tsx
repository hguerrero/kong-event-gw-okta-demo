import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate, useParams } from 'react-router-dom';
import { kafkaApi } from '../services/api';
import { TopicMessagesProps, KafkaMessage, TopicMessagesParams } from '../types';

const TopicMessages: React.FC<TopicMessagesProps> = () => {
  const { authState } = useOktaAuth();
  const navigate = useNavigate();
  const { topicName } = useParams();
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(50);

  const decodedTopicName = topicName ? decodeURIComponent(topicName) : '';

  useEffect(() => {
    if (authState?.isAuthenticated && topicName) {
      fetchMessages();
    }
  }, [authState, topicName, limit]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = authState?.accessToken?.accessToken;
      const messagesData = await kafkaApi.getTopicMessages(accessToken!, decodedTopicName, limit);
      setMessages(messagesData.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (typeof err === 'object' && err !== null) {
        // @ts-ignore: Try to access error properties if available
        setError(
          (err as any).response?.data?.error ||
          (err as any).message ||
          'Failed to fetch messages'
        );
      } else {
        setError('Failed to fetch messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'No timestamp';
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const formatMessageValue = (value?: string): string => {
    if (!value) return '(empty)';
    try {
      // Try to parse as JSON for better formatting
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Return as-is if not JSON
      return value;
    }
  };

  if (!authState?.isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please log in to view topic messages.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/kafka/topics')}
          sx={{ textDecoration: 'none' }}
        >
          Kafka Topics
        </Link>
        <Typography color="text.primary">{decodedTopicName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            📨 Topic Messages
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {decodedTopicName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Messages retrieved through KNEP virtual clusters
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/kafka/topics')}
          >
            Back to Topics
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchMessages}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Message Limit</InputLabel>
          <Select
            value={limit}
            label="Message Limit"
            onChange={(e: SelectChangeEvent<number>) => setLimit(e.target.value as number)}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${messages.length} messages loaded`}
          color="primary"
          icon={<MessageIcon />}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={fetchMessages}>
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
          {messages.length > 0 ? (
            <Box>
              {messages.map((message, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="h6">
                        Message #{index + 1}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Partition: ${message.partition}`}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={`Offset: ${message.offset}`}
                        variant="outlined"
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Message Key */}
                      {message.key && (
                        <Card variant="outlined">
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color="primary">
                              Message Key
                            </Typography>
                            <Box sx={{ 
                              bgcolor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1, 
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                            }}>
                              {message.key}
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* Message Value */}
                      <Card variant="outlined">
                        <CardContent sx={{ py: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Message Value
                          </Typography>
                          <Box sx={{ 
                            bgcolor: 'grey.50', 
                            p: 2, 
                            borderRadius: 1, 
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            maxHeight: 300,
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}>
                            {formatMessageValue(message.value)}
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Message Headers */}
                      {message.headers && Object.keys(message.headers).length > 0 && (
                        <Card variant="outlined">
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color="primary">
                              Headers
                            </Typography>
                            <Box sx={{ 
                              bgcolor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1, 
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                            }}>
                              {JSON.stringify(message.headers, null, 2)}
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* Message Metadata */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          icon={<StorageIcon />}
                          label={`Topic: ${message.topic}`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Partition: ${message.partition}`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Offset: ${message.offset}`}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No messages found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                This topic might be empty or messages might be older than the consumer offset.
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchMessages}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TopicMessages;
