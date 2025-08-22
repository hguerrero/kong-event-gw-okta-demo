# System Configuration Guide

This document covers the system-level configuration for Kong Event Gateway, Kafka, and authentication components.

> 📋 **Environment Variables**: See [Environment Variables Reference](environment-variables.md) for all environment variable details.

## Architecture Overview

The demo consists of these configurable components:
- **Kong Event Gateway (KNEP)**: Event proxy with OAuth authentication
- **Kafka Cluster**: 3-node cluster in KRaft mode
- **Okta Integration**: OAuth/OIDC identity provider
- **Demo Client**: React + Node.js application

## Kong Event Gateway (KNEP) Configuration

### Configuration File: `config/kong/config.yaml`

KNEP uses a YAML configuration file that defines virtual clusters with OAuth authentication:

```yaml
backend_clusters:
  - bootstrap_servers:
      - kafka1:9092
      - kafka2:9092
      - kafka3:9092
    name: kafka-localhost

virtual_clusters:
  - authentication:
      - sasl_oauth_bearer:
          jwks:
            endpoint: https://your-domain.okta.com/oauth2/v1/keys
            timeout: 1s
        type: sasl_oauth_bearer
    backend_cluster_name: kafka-localhost
    name: team-a
    topic_rewrite:
      prefix:
        value: a-
      type: prefix
    route_by:
      port:
        min_broker_id: 1
      type: port
```

### Configuration Sections

| Section | Purpose | Key Settings |
|---------|---------|--------------|
| `backend_clusters` | Kafka cluster connections | Bootstrap servers, cluster name |
| `virtual_clusters` | Isolated tenant environments | Authentication, routing, topic rewriting |
| `authentication` | OAuth Bearer token validation | JWKS endpoint, timeout settings |
| `topic_rewrite` | Automatic topic prefixing | Prefix rules for tenant isolation |
| `route_by` | Client routing strategy | Port-based routing configuration |

## Kafka Cluster Configuration

### KRaft Mode (No Zookeeper)

The Kafka cluster runs in KRaft mode for simplified operations:

| Setting | Value | Purpose |
|---------|-------|---------|
| **Cluster ID** | `abcdefghijklmnopqrstuv` | Unique cluster identifier |
| **Node IDs** | 1, 2, 3 | Broker identification |
| **Controller Quorum** | All nodes | Distributed consensus |
| **Mode** | Combined (broker + controller) | Simplified deployment |

### Network Configuration

| Broker | Internal | Controller | External |
|--------|----------|------------|----------|
| kafka1 | kafka1:9092 | kafka1:9093 | localhost:9094 |
| kafka2 | kafka2:9092 | kafka2:9093 | localhost:9095 |
| kafka3 | kafka3:9092 | kafka3:9093 | localhost:9096 |

### Default Topic Settings

- **Partitions**: 3 (distributed across brokers)
- **Replication Factor**: 3 (full replication for fault tolerance)
- **Retention**: 7 days (configurable per topic)

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
| **kafka1-3** | Kafka cluster (KRaft mode) | 9094-9096 | None |
| **kong-event-gateway** | KNEP proxy | 19092, 8080 | Kafka cluster |
| **kafka-ui** | Kafka monitoring UI | 8180 | Kafka cluster |
| **demo-client** | React + Node.js demo | 3000 | KNEP, Okta |

### Network Configuration

- **Network**: `kong-kafka-net` (bridge mode)
- **Internal DNS**: Service discovery via container names
- **External Access**: Selected ports exposed to host

### Volume Mounts

- **KNEP Config**: `./config/kong/config.yaml` → `/etc/kong/config.yaml`
- **Certificates**: `./config/certs/` → `/etc/ssl/certs/` (if TLS enabled)
- **Kafka Data**: Ephemeral (containers only)

## Security Configuration

### Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **TLS/SSL** | Disabled (HTTP) | Required (HTTPS) |
| **Secrets** | `.env` files | Vault/K8s secrets |
| **Network** | Docker bridge | Private subnets |
| **Kafka** | Single cluster | Multi-AZ deployment |
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

# Kafka cluster status
docker-compose exec kafka1 kafka-broker-api-versions --bootstrap-server kafka1:9092

# Virtual cluster connectivity
nc -zv localhost 19092
```

### Common Configuration Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **OAuth validation fails** | 401 errors, auth failures | Check Okta domain, JWKS endpoint |
| **KNEP-Kafka connection** | Connection timeouts | Verify Kafka brokers running |
| **Virtual cluster access** | Port unreachable | Check KNEP config, port mappings |
| **Topic access denied** | Authorization errors | Verify OAuth token scopes |

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
    backend_cluster_name: kafka-localhost
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

For production deployments, enable TLS:

1. **Generate Certificates**: Place in `config/certs/`
2. **Update KNEP Config**: Enable TLS listeners
3. **Configure Kafka**: Enable SSL on all brokers
4. **Update Clients**: Use SSL bootstrap servers

### Observability Configuration

Enable detailed logging and monitoring:

```yaml
# KNEP logging
environment:
  KNEP__OBSERVABILITY__LOG_FLAGS: "info,knep=debug"

# Kafka JMX metrics
environment:
  KAFKA_JMX_OPTS: "-Dcom.sun.management.jmxremote=true"
```

> 📖 **Next Steps**: See [Deployment Guide](deployment.md) for production deployment patterns.
