# Configuration Reference

This document provides detailed configuration information for the Kong Native Event Proxy (KNEP) + Okta OAuth + Kafka demo.

## Environment Variables

### Main Environment (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OKTA_CLIENT_ID` | OAuth application client ID | - | Yes |
| `OKTA_CLIENT_SECRET` | OAuth application client secret | - | Yes |
| `OKTA_ISSUER` | OAuth issuer URL | - | Yes |
| `CALLBACK_URL` | OAuth callback URL | http://localhost:3000/auth/callback | No |
| `SESSION_SECRET` | Session secret for demo client | - | Yes |
| `KONNECT_API_TOKEN` | Kong Konnect API token | - | Yes |
| `KONNECT_API_HOSTNAME` | Kong Konnect API hostname | us.api.konghq.com | No |
| `KONNECT_CONTROL_PLANE_ID` | Kong Konnect control plane ID | - | Yes |
| `KAFKA_BOOTSTRAP` | Kafka bootstrap servers for demo client | localhost:19092 | No |

### KNEP Configuration (config/kong/config.yaml)

The KNEP configuration defines virtual clusters with OAuth authentication:

| Section | Description | Example |
|---------|-------------|---------|
| `backend_clusters` | Kafka cluster connection | kafka1:9092, kafka2:9092, kafka3:9092 |
| `virtual_clusters` | Virtual cluster definitions | team-a, team-b |
| `authentication` | OAuth Bearer configuration | JWKS endpoint, mediation type |
| `topic_rewrite` | Topic prefixing rules | a-, b- prefixes |
| `route_by` | Port-based routing | 19092+ for team-a, 29092+ for team-b |

## Kong Native Event Proxy Configuration

### Virtual Cluster Configuration (config/kong/config.yaml)

The KNEP configuration defines virtual clusters with authentication:

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

### Key Configuration Elements

- **Backend Clusters**: Define Kafka broker connections
- **Virtual Clusters**: Isolated environments with authentication
- **Authentication**: SASL OAuth Bearer with JWKS validation
- **Topic Rewrite**: Automatic topic prefixing
- **Port Routing**: Port-based virtual cluster access

## Kafka Cluster Configuration

### KRaft Mode Configuration

The Kafka cluster runs in KRaft mode (no Zookeeper):

- **Cluster ID**: `abcdefghijklmnopqrstuv`
- **Node IDs**: 1, 2, 3
- **Controller Quorum**: All nodes participate in controller quorum
- **Listeners**: INTERNAL (inter-broker), CONTROLLER (raft), EXTERNAL (client)

### Broker Configuration

Each broker has:
- **Internal listener**: kafka[1-3]:9092 (inter-broker communication)
- **Controller listener**: kafka[1-3]:9093 (raft protocol)
- **External listener**: localhost:909[4-6] (client connections)

### Topic Configuration

Default topic settings:
- **Partitions**: 3 (distributed across brokers)
- **Replication factor**: 3 (full replication)
- **Retention**: 7 days

## OAuth Configuration

### Okta Application Setup

1. **Application Type**: Web Application
2. **Grant Types**:
   - Authorization Code
   - Client Credentials
3. **Redirect URIs**:
   - `http://localhost:3000/auth/callback` - Demo client callback
4. **JWKS Endpoint**: Used by KNEP for token validation
   - `https://your-domain.okta.com/oauth2/v1/keys`

### Token Validation

KNEP validates OAuth tokens using SASL OAuth Bearer:

1. **JWKS-based validation** using Okta's public keys
2. **Signature verification** with RS256 algorithm
3. **Expiration checking** with configurable timeout
4. **Issuer validation** against Okta domain

### SASL OAuth Bearer Configuration

```yaml
sasl_oauth_bearer:
  jwks:
    endpoint: https://your-domain.okta.com/oauth2/v1/keys
    timeout: 1s
```

The JWKS endpoint provides public keys for token signature verification.

## Docker Compose Configuration

### Services

1. **kafka1, kafka2, kafka3**: 3-node Kafka cluster in KRaft mode
2. **kong-event-gateway**: Kong Native Event Proxy (KNEP)
3. **kafka-ui**: Web UI for Kafka monitoring (port 8180)
4. **demo-client**: Optional demo web application (port 3000)

### Networks

- **kong-kafka-net**: Bridge network for service communication

### Volumes

- Kafka data is stored in container temporary directories
- KNEP configuration mounted from `./config/kong/config.yaml`
- TLS certificates mounted from `./config/certs` (if needed)

## Security Considerations

### Production Recommendations

1. **SSL/TLS**: Enable SSL for all communications
2. **Secrets Management**: Use proper secret management
3. **Network Security**: Restrict network access
4. **Token Security**: Short-lived tokens with refresh
5. **Monitoring**: Enable comprehensive logging and monitoring

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| SSL | Optional | Required |
| Secrets | Environment files | Secret management |
| Kafka | 3-node cluster | Multi-AZ cluster |
| KNEP | Single instance | Load balanced |
| Monitoring | Basic logging | Full observability |

## Troubleshooting Configuration

### Common Issues

1. **OAuth token validation fails**
   - Check Okta domain and credentials
   - Verify JWKS URI accessibility
   - Confirm scope configuration

2. **KNEP cannot connect to Kafka**
   - Verify all Kafka brokers are running
   - Check network connectivity between containers
   - Confirm Kafka listeners configuration

3. **Virtual cluster access issues**
   - Check port mappings (19092+ for team-a)
   - Verify KNEP configuration syntax
   - Confirm backend cluster connectivity

### Configuration Validation

Use these commands to validate configuration:

```bash
# Check KNEP health
curl http://localhost:8080/health/probes/liveness

# Validate Okta JWKS endpoint
curl https://your-domain.okta.com/oauth2/v1/keys

# Test Kafka cluster connectivity
docker-compose exec kafka1 kafka-broker-api-versions --bootstrap-server kafka1:9092
docker-compose exec kafka2 kafka-broker-api-versions --bootstrap-server kafka2:9092
docker-compose exec kafka3 kafka-broker-api-versions --bootstrap-server kafka3:9092
```

## Advanced Configuration

### Multiple Virtual Clusters

Add additional virtual clusters in `config/kong/config.yaml`:

```yaml
virtual_clusters:
  - name: team-c
    authentication:
      - sasl_oauth_bearer:
          jwks:
            endpoint: https://your-domain.okta.com/oauth2/v1/keys
        type: sasl_oauth_bearer
    backend_cluster_name: kafka-localhost
    topic_rewrite:
      prefix:
        value: c-
      type: prefix
    route_by:
      port:
        min_broker_id: 1
        offset: 20000
      type: port
```

### TLS Configuration

Enable TLS for production:

1. Generate certificates in `config/certs/`
2. Update KNEP configuration to use TLS
3. Configure Kafka brokers for SSL

### Monitoring and Observability

Enable debug logging:

```yaml
environment:
  KNEP__OBSERVABILITY__LOG_FLAGS: "info,knep=debug"
```
