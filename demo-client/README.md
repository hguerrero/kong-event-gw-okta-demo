# Kong Native Event Proxy Demo Client

This Node.js application provides a web interface for authenticating with Okta using OpenID Connect (OIDC) and demonstrates interaction with Kong Native Event Proxy (KNEP) virtual clusters. It uses Okta's official `@okta/oidc-middleware` for seamless integration.

## Features

- 🔐 Okta OIDC authentication using official Okta middleware
- 🎫 Display access and refresh tokens
- 👤 Show user profile information
- 📋 Display ID token claims
- 🔄 Session management with logout functionality
- 📋 **List Kafka topics through KNEP virtual clusters using Okta access token**

## Prerequisites

1. **Okta Developer Account**: You need an Okta developer account and an application configured for OIDC.
2. **Node.js**: Make sure you have Node.js installed (version 14 or higher recommended).

## Okta Application Setup

1. Log in to your Okta Developer Console
2. Go to **Applications** > **Create App Integration**
3. Choose **OIDC - OpenID Connect** and **Web Application**
4. Configure your application:
   - **App integration name**: Choose any name (e.g., "KNEP Demo Client")
   - **Grant type**: Authorization Code
   - **Sign-in redirect URIs**: `http://localhost:3000/auth/callback`
   - **Sign-out redirect URIs**: `http://localhost:3000`
   - **Controlled access**: Choose as per your requirements
5. Save the application and note down:
   - **Client ID**
   - **Client Secret**
   - **Okta domain** (e.g., `https://your-domain.okta.com`)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your Okta application credentials:
   ```env
   OKTA_CLIENT_ID=your_actual_client_id
   OKTA_CLIENT_SECRET=your_actual_client_secret
   OKTA_ISSUER=https://your-domain.okta.com
   ```

   **Important**: The `OKTA_ISSUER` should be your base Okta domain (e.g., `https://your-domain.okta.com`), not the OAuth2 authorization server URL.

## Usage

1. Start the application:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Click "Login with Okta" to authenticate

4. After successful authentication, you'll see:
   - Your access token
   - Your refresh token (if available)
   - User profile information
   - Token claims
   - Additional user object details
   - **Button to list Kafka topics using your access token**

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OKTA_CLIENT_ID` | ✅ | Your Okta application client ID | - |
| `OKTA_CLIENT_SECRET` | ✅ | Your Okta application client secret | - |
| `OKTA_ISSUER` | ✅ | Your Okta domain (e.g., https://your-domain.okta.com) | - |
| `CALLBACK_URL` | ❌ | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `SESSION_SECRET` | ❌ | Session encryption secret | Auto-generated |
| `PORT` | ❌ | Server port | `3000` |
| `KAFKA_BOOTSTRAP` | ❌ | KNEP virtual cluster endpoint | `localhost:19092` |

## Available Routes

- `/` - Home page with login
- `/dashboard` - Token information + Kafka topics button
- `/kafka/topics` - List Kafka topics through KNEP using Okta token (clickable)
- `/kafka/topics/:topicName/messages` - **NEW**: View messages from specific topic through KNEP
- `/debug` - Session debugging
- `/logout` - Logout functionality

## Scripts

- `npm start` - Start the web server
- `npm run dev` - Start the web server (same as start)
- `npm run list-topics` - Run the original Kafka topics listing script

## Security Notes

- The `SESSION_SECRET` should be set to a secure random string in production
- In production, ensure `cookie.secure` is set to `true` and use HTTPS
- Store sensitive environment variables securely (not in version control)

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

## Original Kafka Functionality

The original `listTopics.js` script is still available and can be run with:
```bash
npm run list-topics
```

Make sure to set the `KAFKA_BOOTSTRAP` and `KAFKA_TOKEN` environment variables for KNEP functionality.
