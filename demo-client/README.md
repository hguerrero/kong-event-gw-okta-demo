# Kong Native Event Proxy Demo Client

This **application** provides a web interface for authenticating with Okta using OpenID Connect (OIDC) and demonstrates interaction with Kong Native Event Proxy (KNEP) virtual clusters. It features a fully typed React frontend with a Node.js API backend.

## Features

- 🎨 **Modern TypeScript React UI** with Material-UI components
- 🔐 **Okta OIDC authentication** using official Okta React SDK
- 🎫 **Token management** with automatic refresh and type safety
- 👤 **User profile** with detailed information display
- 📋 **Interactive dashboards** with real-time data
- 🚀 **Kafka topic browsing** through KNEP virtual clusters
- 📨 **Message viewing** with syntax highlighting and filtering
- 📱 **Responsive design** that works on all devices
- 🔄 **Real-time updates** and comprehensive error handling
- 🛡️ **Type Safety** with full TypeScript implementation
- 🎯 **Custom Hooks** for API state management
- 🚨 **Error Boundaries** for graceful error handling
- ⚙️ **Dynamic Configuration** - Configure Kafka connection through UI
- 🔧 **Multiple SASL Mechanisms** - Support for OAuth Bearer, PLAIN, SCRAM-SHA-256/512
- 💾 **Persistent Settings** - Configuration saved in browser localStorage

## Architecture

```
React Frontend (Port 3000)
       ↓ (API calls with Bearer token)
Node.js API Server (Port 3001)
       ↓ (SASL OAuth Bearer)
Kong Native Event Proxy (KNEP)
       ↓ (Authenticated requests)
3-Node Kafka Cluster
```

## Dynamic Kafka Configuration

The demo client now supports **dynamic Kafka configuration** through the web UI, allowing you to connect to different Kafka clusters without modifying environment variables or restarting the application.

### Configuration Options

- **Bootstrap Servers**: Comma-separated list of Kafka broker addresses
- **SSL/TLS**: Enable or disable SSL encryption
- **SASL Mechanism**: Choose from:
  - **OAuth Bearer**: Uses your Okta access token (default)
  - **PLAIN**: Username/password authentication
  - **SCRAM-SHA-256**: Salted Challenge Response Authentication
  - **SCRAM-SHA-512**: Enhanced SCRAM with SHA-512
- **Client ID**: Unique identifier for the Kafka client
- **Credentials**: Username/password for non-OAuth mechanisms

### How to Use

1. **Access Settings**: Click on your profile menu → **Settings**
2. **Configure Connection**: Update the Kafka connection parameters
3. **Test Connection**: Use the "Test Connection" button to verify settings
4. **Save Configuration**: Settings are automatically saved to browser localStorage
5. **Use Custom Config**: Topics and messages will use your custom configuration

### Configuration Persistence

- Settings are saved in your browser's localStorage
- Configuration persists across browser sessions
- Each browser/device maintains its own configuration
- Reset to defaults anytime using the "Reset to Defaults" button

### Visual Indicators

When using custom configuration, you'll see:
- **"Using Custom Configuration"** chip on Kafka Topics page
- **"Using Custom Configuration"** chip on Topic Messages page
- Configuration summary in the Settings page

## Prerequisites

1. **Okta Developer Account**: You need an Okta developer account and an application configured for OIDC.
2. **Node.js**: Make sure you have Node.js installed (version 16 or higher recommended).
3. **Kong Native Event Proxy**: KNEP configured with SASL OAuth Bearer authentication.

## Okta Application Setup

1. Log in to your Okta Developer Console
2. Go to **Applications** > **Create App Integration**
3. Choose **OIDC - OpenID Connect** and **Single Page Application**
4. Configure your application:
   - **App integration name**: Choose any name (e.g., "KNEP Demo Client")
   - **Grant type**: Authorization Code
   - **Sign-in redirect URIs**: `http://localhost:3000/auth/callback`
   - **Sign-out redirect URIs**: `http://localhost:3000`
   - **Controlled access**: Choose as per your requirements
5. Save the application and note down:
   - **Client ID**
   - **Okta domain** (e.g., `https://your-domain.okta.com`)

## Installation

1. **Install server dependencies**:
   ```bash
   npm install
   ```

2. **Install client dependencies**:
   ```bash
   npm run install-client
   ```

3. **Configure environment variables**:
   ```bash
   # Copy main environment file
   cp .env.example .env
   
   # Copy React environment file
   cp client/.env.example client/.env.local
   ```

4. **Edit the environment files**:

   **Main `.env` file**:
   ```env
   OKTA_CLIENT_ID=your_actual_client_id
   OKTA_ISSUER=https://your-domain.okta.com
   KAFKA_BOOTSTRAP=localhost:19092
   ```
   
   **React `client/.env.local` file**:
   
   ```env
   REACT_APP_OKTA_ISSUER=https://your-domain.okta.com
   REACT_APP_OKTA_CLIENT_ID=your_actual_client_id
   REACT_APP_API_URL=http://localhost:3001
   ```

## Usage

### Development Mode

1. **Start both servers**:
   ```bash
   npm start
   ```
   This starts both the API server (port 3001) and React dev server (port 3000)

2. **Open your browser** and navigate to `http://localhost:3000`

3. **Authenticate** by clicking "Login with Okta"

4. **Explore the features**:
   - 🏠 **Dashboard**: Overview with user info and quick actions
   - 📋 **Kafka Topics**: Browse topics through KNEP virtual clusters
   - 📨 **Message Viewer**: View and analyze Kafka messages
   - 👤 **Profile**: Detailed user and token information

### Production Mode

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   NODE_ENV=production npm run server
   ```

3. **Access the app** at `http://localhost:3001`

## Environment Variables

### Server Environment (`.env`)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OKTA_CLIENT_ID` | ✅ | Your Okta application client ID | - |
| `OKTA_ISSUER` | ✅ | Your Okta domain (e.g., https://your-domain.okta.com) | - |
| `KAFKA_BOOTSTRAP` | ❌ | KNEP virtual cluster endpoint | `localhost:19092` |
| `PORT` | ❌ | API server port | `3001` |
| `NODE_ENV` | ❌ | Environment mode | `development` |

### React Environment (`client/.env.local`)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `REACT_APP_OKTA_ISSUER` | ✅ | Your Okta domain | - |
| `REACT_APP_OKTA_CLIENT_ID` | ✅ | Your Okta application client ID | - |
| `REACT_APP_API_URL` | ❌ | API server URL | `http://localhost:3001` |

## Available Routes

### Frontend Routes (React App)
- `/` - Modern home page with feature overview and login
- `/dashboard` - Interactive dashboard with user info and quick actions
- `/kafka/topics` - Beautiful topic browser with search and filtering
- `/kafka/topics/:topicName/messages` - Advanced message viewer with syntax highlighting
- `/profile` - Detailed user profile and token information
- `/login/callback` - Okta authentication callback (automatic)

### API Routes (Node.js Backend)
- `GET /api/status` - API health check and configuration info
- `GET /api/kafka/topics` - List Kafka topics (requires Bearer token)
- `GET /api/kafka/topics/:topicName/messages` - Get messages from topic (requires Bearer token)

## Scripts

- `npm start` - Start both API server and React dev server (development)
- `npm run server` - Start only the API server
- `npm run client` - Start only the React dev server
- `npm run build` - Build React app for production
- `npm run install-client` - Install React app dependencies
- `npm run type-check` - Run TypeScript type checking
- `npm run type-check:watch` - Run TypeScript type checking in watch mode

## Technology Stack

### Frontend
- **TypeScript 4.9+** - Full type safety and modern JavaScript features
- **React 18** - Modern React with hooks and functional components
- **Material-UI (MUI) 5** - Beautiful, accessible UI components with TypeScript support
- **Okta React SDK** - Official Okta authentication for React with TypeScript definitions
- **React Router 6** - Client-side routing with TypeScript support
- **Axios** - HTTP client with TypeScript interfaces

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **KafkaJS** - Kafka client for Node.js
- **CORS** - Cross-origin resource sharing

## Security Notes

- **Token-based authentication** using Okta OAuth 2.0
- **SASL OAuth Bearer** for Kafka authentication through KNEP
- **Secure token storage** in React app state (not localStorage)
- **API endpoint protection** with Bearer token validation
- Store sensitive environment variables securely (not in version control)

## API Endpoints

The demo client provides both standard and configuration-aware API endpoints:

### Standard Endpoints
- `GET /api/status` - System status and environment info
- `GET /api/kafka/topics` - List Kafka topics using default/env configuration
- `GET /api/kafka/topics/:topicName/messages` - Get messages from a topic

### Configuration-Aware Endpoints
- `POST /api/kafka/test-connection` - Test Kafka connection with custom config
- `POST /api/kafka/topics-with-config` - List topics with custom configuration
- `POST /api/kafka/topics-with-config/:topicName/messages` - Get messages with custom config

### Request Format for Custom Configuration

```javascript
// POST body for configuration-aware endpoints
{
  "config": {
    "bootstrapServers": "localhost:19092",
    "ssl": false,
    "saslMechanism": "oauthbearer", // or "plain", "scram-sha-256", "scram-sha-512"
    "clientId": "my-client",
    "username": "user", // for non-oauth mechanisms
    "password": "pass"  // for non-oauth mechanisms
  }
}
```

### Authentication

All endpoints (except `/api/status`) require an `Authorization: Bearer <token>` header with a valid Okta access token.

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Make sure your `.env` file exists and contains all required variables
   - Verify that your Okta credentials are correct

2. **Authentication fails**
   - Check that your Okta application's redirect URI matches `CALLBACK_URL`
   - Verify that your Okta domain is correct (should include `https://`)
   - Ensure your Okta application is assigned to your user

3. **"Cannot GET /auth/callback"**
   - This usually means the callback URL in Okta doesn't match your application's callback URL
   - Update either the Okta application settings or the `CALLBACK_URL` environment variable

## Token Information Displayed

The application shows:

- **Access Token**: JWT token for API access
- **Refresh Token**: Token for obtaining new access tokens
- **User Profile**: Basic user information from Okta
- **Token Claims**: All claims contained in the ID token
- **User Object**: Additional authentication details

## KNEP Integration

The application includes Kong Native Event Proxy integration that uses your Okta access token for authentication:

### Features
- **List Topics**: View all topics in your Kafka cluster through KNEP virtual clusters
- **View Messages**: Click on any topic to view recent messages via KNEP
- **Message Details**: See message keys, values, headers, timestamps, and partition/offset info
- **OAuth Authentication**: Uses your Okta access token with SASL OAuth Bearer
- **Virtual Cluster Support**: Access different virtual clusters with topic prefixing
- **Error Handling**: Comprehensive error messages for troubleshooting
- **Configurable Limits**: Control how many messages to retrieve (default: 50, max: 100)

### Configuration
Set the `KAFKA_BOOTSTRAP` environment variable to your KNEP virtual cluster endpoint:
```env
KAFKA_BOOTSTRAP=localhost:19092
# For team-a virtual cluster (default)
# For team-b virtual cluster, use:
# KAFKA_BOOTSTRAP=localhost:29092
```

### Usage
1. Authenticate with Okta
2. Go to the dashboard
3. Click "📋 List Kafka Topics"
4. View topics retrieved using your access token
5. **Click on any topic** to view recent messages
6. Use "Load More" to retrieve up to 100 messages
7. Navigate back to topics list or dashboard as needed

### Requirements
- Kong Native Event Proxy (KNEP) configured with SASL OAuth Bearer
- Your Okta access token must be valid for JWKS verification
- Network connectivity to KNEP virtual cluster endpoints
- KNEP configured with your Okta JWKS endpoint
