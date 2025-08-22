import { useState, useCallback } from 'react';
import { UseApiResult, ApiError } from '../types';

/**
 * Custom hook for API calls with loading, error, and data state management
 * @param apiFunction - The API function to call
 * @returns Object with data, loading, error states and refetch function
 */
export function useApi<T>(
  apiFunction: () => Promise<T>
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.error || 
        apiError.message || 
        'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook specifically for Kafka topics API
 */
export function useKafkaTopics(accessToken?: string) {
  const { kafkaApi } = require('../services/api');
  
  return useApi(() => {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    return kafkaApi.getTopics(accessToken);
  });
}

/**
 * Hook specifically for Kafka messages API
 */
export function useKafkaMessages(
  accessToken?: string, 
  topicName?: string, 
  limit: number = 50
) {
  const { kafkaApi } = require('../services/api');
  
  return useApi(() => {
    if (!accessToken || !topicName) {
      throw new Error('Access token and topic name are required');
    }
    return kafkaApi.getTopicMessages(accessToken, topicName, limit);
  });
}

/**
 * Generic hook for any async operation with error handling
 */
export function useAsyncOperation<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation(...args);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = 
        apiError.response?.data?.error || 
        apiError.message || 
        'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation]);

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
}
