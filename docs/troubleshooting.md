# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Kong Event Gateway demo.

## Quick Diagnostics

### Check KEG Status

```bash
# Check KEG health via Konnect API
curl https://us.api.konghq.com/v1/event-gateways/{gateway_id}/status
```

### Check Demo Client Status

```bash
# Check demo client logs
docker-compose logs demo-client

# Check if running
docker-compose ps
```

## Common Issues

### Demo Client Issues

#### Okta Authentication Fails
- Verify `OKTA_CLIENT_ID` and `OKTA_ISSUER` are correct in `.env`
- Check Okta application redirect URIs match `http://localhost:3000/auth/callback`

#### Cannot Connect to Kafka
- Verify `KAFKA_BOOTSTRAP` points to your KEG virtual cluster endpoint
- Ensure KEG is deployed and running in Konnect
- Check network connectivity to KEG endpoints

### KEG Deployment Issues

#### Terraform Fails to Apply
- Verify `TF_VAR_konnect_token` is set correctly
- Ensure credentials are provided in `terraform.tfvars`
- Run `terraform plan` first to see what will be created

#### Docker Container Not Starting
- Check Docker is running
- Verify network configuration
- Check container logs: `docker logs keg-konnect`

## Getting Help

1. Check the main [README.md](../README.md) for deployment instructions
2. Verify all environment variables are set correctly
3. Ensure KEG is deployed successfully in Kong Konnect
