# System Configuration Guide

This document covers the system-level configuration for Kong Event Gateway, Confluent Cloud, and authentication components.

> 📋 **Environment Variables**: See [Environment Variables Reference](environment-variables.md) for all environment variable details.

## Architecture Overview

The demo consists of these configurable components:
- **Kong Event Gateway (KNEP)**: Event proxy with OAuth authentication
- **Confluent Cloud**: Fully managed Kafka service
- **Okta Integration**: OAuth/OIDC identity provider
- **Demo Client**: React + Node.js application

## Kong Event Gateway (KNEP) Configuration

### Configuration File: `config/kong/config.yaml`

KNEP uses a YAML configuration file that defines virtual clusters with OAuth authentication:

```yaml
backend_clusters:
  - name: confluent-cloud
    bootstrap_servers: 
      - <replace-with-your-bootstrap-server>:<replace-with-your-port>
    authentication:
      type: sasl_plain
      sasl_plain:
        username:
          type: file
          file:
            path: /run/secrets/confluent_cloud_username
        password:
          type: file
          file:
            path: /run/secrets/confluent_cloud_password
    tls:
      insecure_skip_verify: true

virtual_clusters:
  - authentication:
      - sasl_oauth_bearer:
          jwks:
            endpoint: https://your-domain.okta.com/oauth2/v1/keys
            timeout: 1s
        type: sasl_oauth_bearer
    backend_cluster_name: confluent-cloud
    name: team-a
    route_by:
      port:
        min_broker_id: 0
      type: port
```

### Configuration Sections

| Section | Purpose | Key Settings |
|---------|---------|--------------|
| `backend_clusters` | Confluent Cloud connections | Bootstrap servers, SASL_SSL security |
| `virtual_clusters` | Isolated tenant environments | Authentication, routing, topic rewriting |
| `authentication` | OAuth Bearer token validation | JWKS endpoint, timeout settings |
| `route_by` | Client routing strategy | Port-based routing configuration |

## Confluent Cloud Configuration

### Managed Kafka Service

Confluent Cloud provides a fully managed Kafka service with enterprise features:

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Auto-Scaling** | Automatic capacity adjustment | No manual scaling required |
| **Multi-AZ** | Cross-availability zone deployment | High availability and fault tolerance |
| **Security** | Built-in encryption and authentication | Enterprise-grade security |
| **Monitoring** | Comprehensive metrics and alerting | Operational visibility |

### Connection Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| **Protocol** | SASL_SSL | Secure authentication and encryption |
| **SASL Mechanism** | PLAIN | Username/password authentication |
| **Bootstrap Server** | `cluster.region.provider.confluent.cloud:9092` | Cluster endpoint |
| **Credentials** | API Key + API Secret | Authentication credentials |

### Authentication Files

Required files in `config/secrets/`:
- **confluent-api-key.txt**: Confluent Cloud API key
- **confluent-api-secret.txt**: Confluent Cloud API secret
- **confluent-bootstrap.txt**: Bootstrap server endpoint

> 📋 **Setup Guide**: See [Confluent Cloud Setup](../config/secrets/README.md) for detailed instructions.

## OAuth/OIDC Configuration

### Okta Application Requirements

| Setting | Value | Purpose |
|---------|-------|---------|
| **Application Type** | Web Application | Supports authorization code flow |
| **Grant Types** | Authorization Code, Client Credentials | Frontend auth + API access |
| **Redirect URIs** | `http://localhost:3000/auth/callback` | Demo client callback |
| **Sign-out URIs** | `http://localhost:3000` | Post-logout redirect |
| **Trusted Origins** | `http://localhost:3000` | CORS configuration |

### KNEP Token Validation

KNEP validates OAuth tokens using SASL OAuth Bearer mechanism:

```yaml
sasl_oauth_bearer:
  jwks:
    endpoint: https://your-domain.okta.com/oauth2/v1/keys
    timeout: 1s
```

**Validation Process**:
1. **JWKS Retrieval**: Fetch public keys from Okta
2. **Signature Verification**: Validate JWT signature (RS256)
3. **Claims Validation**: Check expiration, issuer, audience
4. **Access Decision**: Allow/deny Kafka operations

## Docker Compose Services

| Service | Purpose | Ports | Dependencies |
|---------|---------|-------|--------------|
| **kong-event-gateway** | KNEP proxy | 19092, 8080 | Confluent Cloud |
| **demo-client** | React + Node.js demo | 3000 | KNEP, Okta |

### Network Configuration

- **Network**: `kong-kafka-net` (bridge mode)
- **External Services**: Confluent Cloud, Okta, Kong Konnect
- **External Access**: Selected ports exposed to host

### Volume Mounts

- **KNEP Config**: `./config/kong/config.yaml` → `/etc/kong/config.yaml`
- **Confluent Secrets**: `./config/secrets/` → `/run/secrets/` (API keys)
- **Certificates**: `./config/certs/` → `/etc/ssl/certs/` (if TLS enabled)

## Security Configuration

### Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **TLS/SSL** | Disabled (HTTP) | Required (HTTPS) |
| **Secrets** | `.env` files | Vault/K8s secrets |
| **Network** | Docker bridge | Private subnets |
| **Confluent Cloud** | Shared cluster | Dedicated cluster |
| **KNEP** | Single instance | Load balanced |
| **Monitoring** | Console logs | Centralized logging |

### Production Hardening

1. **Enable TLS**: All service-to-service communication
2. **Rotate Secrets**: Regular token and certificate rotation
3. **Network Isolation**: Private networks, security groups
4. **Access Control**: Principle of least privilege
5. **Monitoring**: Comprehensive observability stack

## Configuration Validation

### Health Checks

```bash
# KNEP health and readiness
curl http://localhost:8080/health/probes/liveness
curl http://localhost:8080/health/probes/readiness

# Okta JWKS endpoint
curl https://your-domain.okta.com/oauth2/v1/keys

# Confluent Cloud connectivity (requires kafkacat/kcat)
kafkacat -b $(cat config/secrets/confluent-bootstrap.txt) \
  -X security.protocol=SASL_SSL \
  -X sasl.mechanism=PLAIN \
  -X sasl.username=$(cat config/secrets/confluent-api-key.txt) \
  -X sasl.password=$(cat config/secrets/confluent-api-secret.txt) \
  -L

# Virtual cluster connectivity
nc -zv localhost 19092
```

### Common Configuration Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **OAuth validation fails** | 401 errors, auth failures | Check Okta domain, JWKS endpoint |
| **KNEP-Confluent connection** | Connection timeouts | Verify Confluent Cloud credentials |
| **Virtual cluster access** | Port unreachable | Check KNEP config, port mappings |
| **Topic access denied** | Authorization errors | Verify Confluent Cloud API key permissions |

## Advanced Configuration

### Multiple Virtual Clusters

Add additional tenant isolation by configuring multiple virtual clusters:

```yaml
virtual_clusters:
  - name: team-b
    authentication:
      - sasl_oauth_bearer:
          jwks:
            endpoint: https://your-domain.okta.com/oauth2/v1/keys
        type: sasl_oauth_bearer
    backend_cluster_name: confluent-cloud
    topic_rewrite:
      prefix:
        value: b-
      type: prefix
    route_by:
      port:
        min_broker_id: 1
        offset: 10000  # team-b uses ports 29092+
      type: port
```

### TLS/SSL Configuration

Confluent Cloud uses TLS by default. For additional security:

1. **Client Certificates**: Optional mTLS for enhanced security
2. **KNEP TLS**: Enable TLS listeners for client connections
3. **Certificate Management**: Use proper certificate rotation
4. **Network Security**: Configure security groups and firewalls

### Observability Configuration

Enable detailed logging and monitoring:

```yaml
# KNEP logging
environment:
  KNEP__OBSERVABILITY__LOG_FLAGS: "info,knep=debug"

# Confluent Cloud metrics (via API)
environment:
  CONFLUENT_CLOUD_API_KEY: "{{ .Env.CONFLUENT_API_KEY }}"
  CONFLUENT_CLOUD_API_SECRET: "{{ .Env.CONFLUENT_API_SECRET }}"
```

> 📖 **Next Steps**: See [Deployment Guide](deployment.md) for production deployment patterns.
