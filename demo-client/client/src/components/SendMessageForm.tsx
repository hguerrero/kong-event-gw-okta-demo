import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { KafkaProduceMessageRequest, KafkaProduceMessageResponse } from '../types';

interface SendMessageFormProps {
  topicName: string;
  onMessageSent: (response: KafkaProduceMessageResponse) => void;
  onSendMessage: (message: KafkaProduceMessageRequest) => Promise<KafkaProduceMessageResponse>;
  loading?: boolean;
}

interface HeaderEntry {
  key: string;
  value: string;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({
  topicName,
  onMessageSent,
  onSendMessage,
  loading = false,
}) => {
  const [messageKey, setMessageKey] = useState<string>('');
  const [messageValue, setMessageValue] = useState<string>('');
  const [partition, setPartition] = useState<string>('');
  const [headers, setHeaders] = useState<HeaderEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const formatJsonValue = () => {
    try {
      const parsed = JSON.parse(messageValue);
      setMessageValue(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // If it's not valid JSON, leave it as is
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageValue.trim()) {
      setError('Message value is required');
      return;
    }

    setError(null);
    setSuccess(null);
    setSending(true);

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          headersObj[header.key.trim()] = header.value.trim();
        }
      });

      const message: KafkaProduceMessageRequest = {
        key: messageKey.trim() || undefined,
        value: messageValue,
        headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
        partition: partition ? parseInt(partition) : undefined,
      };

      const response = await onSendMessage(message);
      
      setSuccess(`Message sent successfully! Partition: ${response.partition}, Offset: ${response.offset}`);
      onMessageSent(response);
      
      // Reset form
      setMessageKey('');
      setMessageValue('');
      setPartition('');
      setHeaders([]);
      setExpanded(false);
    } catch (err) {
      console.error('Error sending message:', err);
      if (typeof err === 'object' && err !== null) {
        setError(
          (err as any).response?.data?.error ||
          (err as any).message ||
          'Failed to send message'
        );
      } else {
        setError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Accordion expanded={expanded} onChange={(_, isExpanded) => setExpanded(isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SendIcon color="primary" />
            <Typography variant="h6">
              Send Message to Topic
            </Typography>
            <Chip
              label={topicName}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {/* Message Key */}
            <TextField
              label="Message Key (optional)"
              value={messageKey}
              onChange={(e) => setMessageKey(e.target.value)}
              fullWidth
              placeholder="Enter message key..."
              helperText="Optional key for the message. Used for partitioning and message ordering."
            />

            {/* Message Value */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2">Message Value *</Typography>
                <Button
                  size="small"
                  startIcon={<CodeIcon />}
                  onClick={formatJsonValue}
                  variant="outlined"
                  sx={{ ml: 'auto' }}
                >
                  Format JSON
                </Button>
              </Box>
              <TextField
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
                fullWidth
                multiline
                rows={6}
                placeholder="Enter message content..."
                required
                helperText="The message content. Can be plain text, JSON, or any other format."
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            <Divider />

            {/* Advanced Options */}
            <Typography variant="subtitle2" color="text.secondary">
              Advanced Options
            </Typography>

            {/* Partition */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Partition (optional)</InputLabel>
              <Select
                value={partition}
                label="Partition (optional)"
                onChange={(e: SelectChangeEvent) => setPartition(e.target.value)}
              >
                <MenuItem value="">Auto (default)</MenuItem>
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>

            {/* Headers */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2">Headers</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addHeader}
                  variant="outlined"
                >
                  Add Header
                </Button>
              </Box>
              
              {headers.map((header, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeHeader(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              {headers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No headers added. Click "Add Header" to include custom headers.
                </Typography>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={sending || loading || !messageValue.trim()}
                size="large"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default SendMessageForm;
