// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Kafka Types
export interface KafkaTopicsResponse {
  success: boolean;
  topics: string[];
  count: number;
  timestamp: string;
}

export interface KafkaMessage {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  value: string;
  headers?: Record<string, any>;
  timestamp?: string;
}

export interface KafkaMessagesResponse {
  success: boolean;
  messages: KafkaMessage[];
  count: number;
  topic: string;
  limit: number;
  timestamp: string;
}

// User Types
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  zoneinfo?: string;
}

export interface TokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  auth_time?: number;
  nonce?: string;
  acr?: string;
  amr?: string[];
  azp?: string;
  at_hash?: string;
  c_hash?: string;
  scp?: string[];
  groups?: string[];
  [key: string]: any;
}

// Okta Auth Types
export interface OktaAuthState {
  isAuthenticated?: boolean;
  isPending?: boolean;
  accessToken?: {
    accessToken: string;
    claims: TokenClaims;
    expiresAt: number;
    tokenType: string;
    scopes: string[];
    authorizeUrl: string;
    userinfoUrl: string;
  };
  idToken?: {
    idToken: string;
    claims: TokenClaims;
    expiresAt: number;
    issuer: string;
    audience: string;
  };
  error?: Error;
}

// Component Props Types
export interface NavbarProps {}

export interface HomeProps {}

export interface DashboardProps {}

export interface KafkaTopicsProps {}

export interface TopicMessagesProps {}

export interface ProfileProps {}

// API Service Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
  request?: any;
  config?: any;
}

// Environment Variables
export interface EnvironmentConfig {
  REACT_APP_OKTA_ISSUER: string;
  REACT_APP_OKTA_CLIENT_ID: string;
  REACT_APP_API_URL?: string;
}

// Status Response
export interface StatusResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: {
    kafka_bootstrap: string;
    node_env: string;
  };
}

// Route Parameters
export interface TopicMessagesParams {
  topicName: string;
}

// Hook Return Types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Theme Types (extending MUI theme)
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }

  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}
