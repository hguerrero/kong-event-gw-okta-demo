import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  KafkaTopicsResponse,
  KafkaMessagesResponse,
  StatusResponse,
  ApiError,
  KafkaConnectionConfig,
  KafkaConnectionTestResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // The token will be added by the calling component
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const kafkaApi = {
  // Get list of Kafka topics
  getTopics: async (accessToken: string): Promise<KafkaTopicsResponse> => {
    const response = await api.get<KafkaTopicsResponse>('/api/kafka/topics', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  // Get messages from a specific topic
  getTopicMessages: async (
    accessToken: string,
    topicName: string,
    limit: number = 50
  ): Promise<KafkaMessagesResponse> => {
    const response = await api.get<KafkaMessagesResponse>(
      `/api/kafka/topics/${encodeURIComponent(topicName)}/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: { limit },
      }
    );
    return response.data;
  },

  // Get system status
  getStatus: async (): Promise<StatusResponse> => {
    const response = await api.get<StatusResponse>('/api/status');
    return response.data;
  },

  // Test Kafka connection with custom configuration
  testConnection: async (
    accessToken: string,
    config: KafkaConnectionConfig
  ): Promise<KafkaConnectionTestResponse> => {
    const response = await api.post<KafkaConnectionTestResponse>(
      '/api/kafka/test-connection',
      { config },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  // Get topics with custom configuration
  getTopicsWithConfig: async (
    accessToken: string,
    config?: KafkaConnectionConfig
  ): Promise<KafkaTopicsResponse> => {
    const endpoint = config ? '/api/kafka/topics-with-config' : '/api/kafka/topics';
    const data = config ? { config } : undefined;

    const response = await api.request<KafkaTopicsResponse>({
      method: config ? 'POST' : 'GET',
      url: endpoint,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  // Get topic messages with custom configuration
  getTopicMessagesWithConfig: async (
    accessToken: string,
    topicName: string,
    limit: number = 50,
    config?: KafkaConnectionConfig
  ): Promise<KafkaMessagesResponse> => {
    const endpoint = config
      ? `/api/kafka/topics-with-config/${encodeURIComponent(topicName)}/messages`
      : `/api/kafka/topics/${encodeURIComponent(topicName)}/messages`;

    const data = config ? { config } : undefined;

    const response = await api.request<KafkaMessagesResponse>({
      method: config ? 'POST' : 'GET',
      url: endpoint,
      data,
      params: config ? { limit } : { limit },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};

export default api;
