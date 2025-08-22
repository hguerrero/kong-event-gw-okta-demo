# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Kong Native Event Proxy (KNEP) + Okta OAuth + Kafka demo.

## Quick Diagnostics

### Check Service Status

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs kong-event-gateway
docker-compose logs kafka
docker-compose logs zookeeper

# Check KNEP health
curl http://localhost:8080/health/probes/liveness

# Check Kafka topics
docker-compose exec kafka1 kafka-topics.sh --list --bootstrap-server kafka1:9092
```

### Verify Configuration

```bash
# Check environment variables
cat .env

# Validate KNEP configuration
curl http://localhost:8080/health/probes/liveness

# Check KNEP logs for configuration errors
docker-compose logs knep-konnect
```

## Common Issues

### 1. OAuth Authentication Failures

#### Symptoms
- HTTP 401 Unauthorized responses
- "Invalid token" errors
- OAuth token acquisition fails

#### Possible Causes & Solutions

**Invalid Okta Configuration**
```bash
# Check Okta configuration
curl https://your-domain.okta.com/.well-known/openid_configuration

# Verify your configuration matches the well-known endpoint
```

**Incorrect Client Credentials**
- Verify `OKTA_CLIENT_ID` and `OKTA_CLIENT_SECRET` in `.env`
- Ensure the Okta application is configured correctly
- Check that the application has the required grant types enabled

**Token Expiration**
- Tokens expire after 1 hour by default
- The demo scripts handle token refresh automatically
- For manual testing, obtain a fresh token

**JWKS Endpoint Issues**
```bash
# Check if JWKS endpoint is accessible
curl https://your-domain.okta.com/oauth2/v1/keys

# Verify KNEP configuration has correct JWKS endpoint
grep -A 5 "jwks:" config/kong/config.yaml
```

### 2. Kong Native Event Proxy Issues

#### Symptoms
- KNEP health check fails
- Virtual cluster access denied
- Configuration not loading

#### Possible Causes & Solutions

**KNEP Configuration Issues**
```bash
# Check KNEP logs
docker-compose logs knep-konnect

# Validate configuration syntax
# KNEP will log configuration errors on startup
docker-compose restart knep-konnect
```

**Konnect Connection Issues**
```bash
# Check Konnect API token and control plane ID
echo $KONNECT_API_TOKEN
echo $KONNECT_CONTROL_PLANE_ID

# Verify Konnect connectivity
curl -H "Authorization: Bearer $KONNECT_API_TOKEN" \
  https://us.api.konghq.com/v2/control-planes/$KONNECT_CONTROL_PLANE_ID
```

**Port Conflicts**
```bash
# Check if ports are in use
lsof -i :8080   # KNEP health/admin
lsof -i :19092  # team-a virtual cluster
lsof -i :29092  # team-b virtual cluster
lsof -i :8180   # Kafka UI

# Stop conflicting services or change ports in docker-compose.yml
```

### 3. Kafka Connectivity Issues

#### Symptoms
- Cannot publish/consume messages
- Kafka broker not reachable
- Topic creation fails

#### Possible Causes & Solutions

**Kafka Cluster Not Started**
```bash
# Check Kafka cluster status
docker-compose logs kafka1
docker-compose logs kafka2
docker-compose logs kafka3

# Restart Kafka cluster
docker-compose restart kafka1 kafka2 kafka3
```

**Network Issues**
```bash
# Test Kafka connectivity from KNEP container
docker-compose exec knep-konnect nc -zv kafka1 9092
docker-compose exec knep-konnect nc -zv kafka2 9092
docker-compose exec knep-konnect nc -zv kafka3 9092

# Check network configuration
docker network ls
docker network inspect kafka_cluster_with_knep_kong-kafka-net
```

**Topic Issues**
```bash
# List topics
docker-compose exec kafka1 kafka-topics.sh --list --bootstrap-server kafka1:9092

# Create topic manually
docker-compose exec kafka1 kafka-topics.sh \
  --create --topic demo-events \
  --bootstrap-server kafka1:9092 \
  --partitions 3 --replication-factor 3
```

### 4. Docker and Container Issues

#### Symptoms
- Services won't start
- Out of memory errors
- Volume mount issues

#### Possible Causes & Solutions

**Insufficient Resources**
```bash
# Check Docker resources
docker system df
docker system prune  # Clean up unused resources

# Increase Docker memory/CPU limits in Docker Desktop
```

**Volume Permission Issues**
```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./data/
chmod -R 755 ./data/
```

**Container Conflicts**
```bash
# Remove existing containers
docker-compose down -v
docker system prune -a

# Rebuild and restart
docker-compose up --build -d
```

### 5. Network and Connectivity Issues

#### Symptoms
- Services can't communicate
- External API calls fail
- DNS resolution issues

#### Possible Causes & Solutions

**Docker Network Issues**
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

**Firewall/Proxy Issues**
```bash
# Check if corporate firewall blocks Okta
curl -v https://your-domain.okta.com/.well-known/openid_configuration

# Configure proxy if needed
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

**DNS Resolution**
```bash
# Test DNS from container
docker-compose exec kong-event-gateway nslookup your-domain.okta.com
```

## Debugging Steps

### 1. Enable Debug Logging

**Kong Debug Logging**
```yaml
# In config/kong/kong.conf
log_level = debug
```

**Application Debug Logging**
```bash
# Set environment variable
export LOG_LEVEL=debug
```

### 2. Monitor Network Traffic

```bash
# Monitor Kong proxy traffic
docker-compose logs -f kong-event-gateway | grep "proxy"

# Monitor Kafka traffic
docker-compose logs -f kafka | grep "INFO"
```

### 3. Test Components Individually

**Test Okta OAuth**
```bash
# Test token endpoint directly
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=kafka:read kafka:write" \
  https://your-domain.okta.com/oauth2/default/v1/token
```

**Test Kong Without OAuth**
```bash
# Temporarily disable OAuth plugin
curl -X PATCH http://localhost:8001/plugins/PLUGIN_ID \
  -d "enabled=false"

# Test direct access
curl -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","message":"hello"}'
```

**Test Kafka Directly**
```bash
# Produce message directly to Kafka
docker-compose exec kafka kafka-console-producer.sh \
  --topic demo-events --bootstrap-server localhost:9092

# Consume messages directly from Kafka
docker-compose exec kafka kafka-console-consumer.sh \
  --topic demo-events --bootstrap-server localhost:9092 --from-beginning
```

## Performance Issues

### High Memory Usage

```bash
# Check memory usage
docker stats

# Reduce Kafka memory
# Edit docker-compose.yml and add:
environment:
  KAFKA_HEAP_OPTS: "-Xmx512M -Xms512M"
```

### Slow Response Times

```bash
# Check Kong metrics
curl http://localhost:8001/metrics

# Monitor database performance
docker-compose exec kong-database pg_stat_activity
```

## Getting Help

### Log Collection

When reporting issues, collect these logs:

```bash
# Create log bundle
mkdir -p troubleshooting-logs
docker-compose logs > troubleshooting-logs/docker-compose.log
docker-compose logs kong-event-gateway > troubleshooting-logs/kong.log
docker-compose logs kafka > troubleshooting-logs/kafka.log
curl -s http://localhost:8001/status > troubleshooting-logs/kong-status.json
```

### Environment Information

```bash
# System information
docker version
docker-compose version
uname -a

# Configuration
cat .env
cat config/okta/okta.env
```

### Useful Commands Reference

```bash
# Restart everything
docker-compose down && docker-compose up -d

# Reset database
docker-compose down -v && docker-compose up -d

# View real-time logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec kong-event-gateway bash
docker-compose exec kafka bash

# Check container resource usage
docker stats --no-stream
```

## Prevention

### Regular Maintenance

1. **Monitor disk space**: Docker volumes can grow large
2. **Update images**: Keep Docker images updated
3. **Clean up**: Regular `docker system prune`
4. **Backup**: Backup important configuration and data

### Best Practices

1. **Use specific image tags** instead of `latest`
2. **Set resource limits** in docker-compose.yml
3. **Monitor logs** for warnings and errors
4. **Test configuration changes** in development first
5. **Document customizations** for future reference
