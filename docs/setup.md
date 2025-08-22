# Setup Guide

This guide walks you through setting up the Kong Native Event Proxy (KNEP) + Okta OAuth + Kafka demo environment.

## Prerequisites

### Required Software
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- curl or similar HTTP client
- jq (for JSON processing in scripts)

### Okta Account
1. Sign up for a free Okta Developer account at https://developer.okta.com/
2. Create a new application in your Okta dashboard

### Kong Konnect Account
1. Sign up for Kong Konnect at https://konghq.com/
2. Create a control plane for KNEP
3. Get your API token and control plane ID

## Step 1: Okta Application Setup

### Create OAuth Application
1. Log into your Okta Developer Console
2. Navigate to **Applications** > **Applications**
3. Click **Create App Integration**
4. Select **OIDC - OpenID Connect**
5. Choose **Single Page Application**
6. Configure the application:
   - **App integration name**: Kong Native Event Proxy Demo
   - **Grant type**: Authorization Code, Client Credentials
   - **Sign-in redirect URIs**: `http://localhost:3000/auth/callback`
   - **Sign-out redirect URIs**: `http://localhost:3000/logout`
   - **Controlled access**: Allow everyone in your organization to access

### Note Application Credentials
After creating the application, note down:
- Client ID
- Okta Domain
- Issuer URL (typically `https://your-domain.okta.com`)

### Configure JWKS Endpoint
The KNEP configuration uses your Okta JWKS endpoint for token validation:
- JWKS URL: `https://your-domain.okta.com/oauth2/v1/keys`

## Step 2: Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Update the configuration** with your credentials:
   ```bash
   # Edit .env
   # Okta Configuration
   OKTA_CLIENT_ID=your_okta_client_id_here
   OKTA_ISSUER=https://your-domain.okta.com
   
   # Kong Konnect Configuration
   KONNECT_API_TOKEN=your_konnect_token
   KONNECT_CONTROL_PLANE_ID=your_control_plane_id
   ```
   
3. **Update KNEP configuration**:
   ```bash
   # Edit config/kong/config.yaml
   # Update the JWKS endpoint with your Okta domain
   jwks:
     endpoint: https://your-domain.okta.com/oauth2/v1/keys
   ```

## Step 3: Start the Environment

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

   You should see:
   - Kong Native Event Proxy (knep-konnect)
   - 3 Kafka brokers (kafka1, kafka2, kafka3)
   - Kafka UI
   - (Optional) Demo Client

3. **Check KNEP status**:
   ```bash
   curl -i http://localhost:8080/health/probes/liveness
   ```

## Step 4: Configure Virtual Clusters

The KNEP configuration needs to be loaded into Konnect from `config/kong/config.yaml`. You can verify the configuration:

```bash
# Check KNEP health
curl http://localhost:8080/health/probes/liveness

# Check virtual clusters (via logs)
docker-compose logs knep-konnect

# Test Kafka connectivity
docker-compose exec kafka1 kafka-topics.sh --list --bootstrap-server kafka1:9092
```

## Troubleshooting

If you encounter issues, check:

1. **Docker services status**:
   ```bash
   docker-compose logs knep-konnect
   docker-compose logs kafka1
   docker-compose logs kafka2
   docker-compose logs kafka3
   ```

2. **Okta configuration**:
   - Verify your Okta domain and credentials
   - Check that redirect URIs match your configuration
   - Ensure JWKS endpoint is accessible

3. **Network connectivity**:
   ```bash
   # Test KNEP health
   curl http://localhost:8080/health/probes/liveness
   
   # Test Kafka cluster
   docker-compose exec kafka1 kafka-topics.sh --list --bootstrap-server kafka1:9092
   
   # Test virtual cluster ports
   nc -zv localhost 19092  # team-a virtual cluster
   nc -zv localhost 29092  # team-b virtual cluster (if configured)
   ```

## Next Steps

Once the setup is complete, you can:
- Explore the example client application in `demo-client/`
- Modify the KNEP configuration in `config/kong/config.yaml`
- Test OAuth flows with virtual clusters
- Monitor events through Kafka UI at http://localhost:8180
- Access the demo client at http://localhost:3000 (with --profile demo)

For more detailed configuration options, see [Configuration Reference](configuration.md).
