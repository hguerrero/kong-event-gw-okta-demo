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

## Kafka Backend Selection

This demo supports two Kafka backends:

| Backend | `kafka_backend` | Bootstrap Servers |
|---------|-----------------|-------------------|
| Confluent Cloud | `confluent` | `bootstrap_servers` |
| Local Kafka | `local` | `bootstrap_servers_local` |

### Confluent Cloud Configuration

```hcl
# terraform.tfvars
kafka_backend       = "confluent"
bootstrap_servers  = ["pkc-xxxxx.us-east-2.aws.confluent.cloud:9092"]
kafka_username     = "your-api-key"
kafka_password     = "your-api-secret"
```

### Local Kafka Configuration

```hcl
# terraform.tfvars
kafka_backend            = "local"
bootstrap_servers_local = ["localhost:9094"]
# No kafka_username or kafka_password needed
```

Then start Docker Compose with the local profile:

```bash
docker-compose --profile local up -d
```

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
