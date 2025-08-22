# Environment Variables Reference

Quick reference for all environment variables used in the Kong Event Gateway demo.

> 📋 **Setup**: Copy `.env.example` to `.env` and configure the required variables below.

## Required Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OKTA_CLIENT_ID` | ✅ | Okta application client ID | `0oa1a2b3c4d5e6f7g8h9` |
| `OKTA_ISSUER` | ✅ | Okta domain/issuer URL | `https://dev-123456.okta.com` |
| `KONNECT_API_TOKEN` | ✅ | Kong Konnect API token | `kpat_abc123...` |
| `KONNECT_CONTROL_PLANE_ID` | ✅ | Control plane ID for KNEP | `12345678-1234-1234-1234-123456789012` |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CALLBACK_URL` | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `SESSION_SECRET` | Session encryption secret | Auto-generated |
| `KAFKA_BOOTSTRAP` | KNEP virtual cluster endpoint | `localhost:19092` |
| `KONNECT_API_HOSTNAME` | Kong Konnect API hostname | `us.api.konghq.com` |
| `REACT_APP_OKTA_ISSUER` | React build: Okta issuer | Same as `OKTA_ISSUER` |
| `REACT_APP_OKTA_CLIENT_ID` | React build: Okta client ID | Same as `OKTA_CLIENT_ID` |
| `REACT_APP_API_URL` | React build: API server URL | Empty (same-origin) |

## Example Configuration

### Complete `.env` File
```env
# Required - Okta Configuration
OKTA_CLIENT_ID=0oa1a2b3c4d5e6f7g8h9
OKTA_ISSUER=https://dev-123456.okta.com

# Required - Kong Konnect
KONNECT_API_TOKEN=kpat_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
KONNECT_CONTROL_PLANE_ID=12345678-1234-1234-1234-123456789012

# Optional - Demo Client
CALLBACK_URL=http://localhost:3000/auth/callback
SESSION_SECRET=your-super-secret-session-key-change-in-production
KAFKA_BOOTSTRAP=localhost:19092

# Optional - React Build (Docker only)
REACT_APP_OKTA_ISSUER=https://dev-123456.okta.com
REACT_APP_OKTA_CLIENT_ID=0oa1a2b3c4d5e6f7g8h9
REACT_APP_API_URL=""
```

### Development Environment Files

**For React development** (`demo-client/client/.env.local`):
```env
REACT_APP_OKTA_ISSUER=https://your-domain.okta.com
REACT_APP_OKTA_CLIENT_ID=your_okta_client_id_here
REACT_APP_API_URL=http://localhost:3001
```

**For API server development** (`demo-client/.env`):
```env
OKTA_CLIENT_ID=your_okta_client_id_here
OKTA_ISSUER=https://your-domain.okta.com
PORT=3001
KAFKA_BOOTSTRAP=localhost:19092
```

## Quick Validation

```bash
# Validate environment file
cat .env

# Test Okta endpoint
curl https://your-domain.okta.com/.well-known/openid_configuration

# Test KNEP connection
nc -zv localhost 19092

# Validate Docker Compose config
docker-compose config
```

## Common Issues

| Issue | Check | Solution |
|-------|-------|----------|
| React auth fails | `REACT_APP_OKTA_*` variables | Match main Okta config |
| API auth fails | `OKTA_CLIENT_ID`, `OKTA_ISSUER` | Verify Okta app settings |
| Kafka connection fails | `KAFKA_BOOTSTRAP` | Ensure KNEP is running |
| Docker build fails | All required variables set | Check `.env` completeness |

> 📖 **For detailed configuration**: See [Configuration Guide](configuration.md)
