# Environment Variables Reference

Quick reference for all environment variables used in the Kong Event Gateway demo.

## Demo Client Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OKTA_CLIENT_ID` | Yes | Okta application client ID | `0oa1a2b3c4d5e6f7g8h9` |
| `OKTA_ISSUER` | Yes | Okta domain/issuer URL | `https://dev-123456.okta.com` |
| `KAFKA_BOOTSTRAP` | Yes | KEG virtual cluster endpoint | `your-endpoint.kafka.io:19092` |
| `CALLBACK_URL` | No | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `SESSION_SECRET` | No | Session secret for production | Random string |

## Terraform Variables

See [README.md](../README.md#deploying-with-terraform) for Terraform deployment variables.

## Setting Environment Variables

### For Demo Client

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

### For Terraform

Set via `TF_VAR_` prefix or in `terraform.tfvars`:

```bash
export TF_VAR_konnect_token="your-token"
```
