import { useState, useEffect } from 'react';
import { KafkaConnectionConfig } from '../types';

const DEFAULT_CONFIG: KafkaConnectionConfig = {
  bootstrapServers: 'localhost:19092',
  ssl: false,
  saslMechanism: 'oauthbearer',
  clientId: 'knep-demo-client'
};

const STORAGE_KEY = 'kafkaConnectionConfig';

export const useKafkaConfig = () => {
  const [config, setConfig] = useState<KafkaConnectionConfig>(DEFAULT_CONFIG);
  const [isCustomConfig, setIsCustomConfig] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
        setIsCustomConfig(true);
      } catch (error) {
        console.error('Error parsing saved Kafka config:', error);
        setConfig(DEFAULT_CONFIG);
        setIsCustomConfig(false);
      }
    }
  }, []);

  const saveConfig = (newConfig: KafkaConnectionConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      setIsCustomConfig(true);
      return true;
    } catch (error) {
      console.error('Error saving Kafka config:', error);
      return false;
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_CONFIG);
    setIsCustomConfig(false);
  };

  const getConfig = (): KafkaConnectionConfig | undefined => {
    return isCustomConfig ? config : undefined;
  };

  return {
    config,
    isCustomConfig,
    saveConfig,
    resetToDefault,
    getConfig,
    defaultConfig: DEFAULT_CONFIG
  };
};

export default useKafkaConfig;
