# System Configuration Guide

This document covers the system-level configuration for Kong Event Gateway, Confluent Cloud, and the demo client application.

## Architecture Overview

The demo consists of these components:
- **Kong Event Gateway (KEG)** - Deployed via Terraform to Kong Konnect
- **Confluent Cloud** - Fully managed Kafka service
- **Okta** - OAuth/OIDC identity provider
- **Demo Client** - React + Node.js application

## KEG Deployment

KEG is deployed using Terraform. See the [README.md](../README.md#deploying-with-terraform) for detailed instructions.

### Configuration

KEG configuration is managed through Terraform variables in `terraform/environments/dev/terraform.tfvars`:

```hcl
bootstrap_servers  = ["your-confluent-bootstrap-servers"]
okta_jwks_endpoint = "https://your-org.okta.com/oauth2/v1/keys"
kafka_username     = "your-confluent-api-key"
kafka_password     = "your-confluent-api-secret"
```

### KEG Components

When deployed, Terraform creates:
1. **Event Gateway** - The main KEG resource
2. **Backend Cluster** - Connection to Confluent Cloud
3. **Virtual Cluster** - Logical partition with OAuth authentication
4. **Listeners** - Internal and external endpoints
5. **Forward Policies** - Traffic routing rules

## Demo Client Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OKTA_CLIENT_ID` | Yes | Okta application client ID |
| `OKTA_ISSUER` | Yes | Okta domain/issuer URL |
| `KAFKA_BOOTSTRAP` | Yes | KEG virtual cluster endpoint |
| `CALLBACK_URL` | No | OAuth callback URL |
| `SESSION_SECRET` | No | Session secret for production |

### Running the Demo Client

```bash
# Start with Docker
docker-compose up -d demo-client

# Or run locally
cd demo-client/client && npm start
```

## Port Reference

| Service | Port | Description |
|---------|------|-------------|
| Demo Client | 3000 | Web UI |
| KEG Internal | 19092-19192 | Internal Kafka listeners |
| KEG External | 29092-29192 | External Kafka listeners |
| KEG API | 8080 | Admin API |
