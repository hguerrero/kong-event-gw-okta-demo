# Confluent Cloud Authentication Secrets

This directory contains authentication files required to connect Kong Event Gateway to Confluent Cloud.

## Required Files

Place the following files in this directory to authenticate with Confluent Cloud:

### 1. API Key File (`confluent-api-key.txt`)
```
your-confluent-api-key
```

### 2. API Secret File (`confluent-api-secret.txt`)
```
your-confluent-api-secret
```

### 3. Bootstrap Servers File (`confluent-bootstrap.txt`)
```
your-cluster.region.provider.confluent.cloud:9092
```

## Obtaining Confluent Cloud Credentials

### Step 1: Create a Confluent Cloud Account
1. Sign up at [Confluent Cloud](https://confluent.cloud/)
2. Create a new cluster or use an existing one

### Step 2: Generate API Keys
1. Navigate to your Kafka cluster in the Confluent Cloud Console
2. Go to **API Keys** section
3. Click **Create Key**
4. Choose **Global Access** or **Granular Access** based on your needs
5. Download or copy the **API Key** and **API Secret**

### Step 3: Get Bootstrap Servers
1. In your Kafka cluster dashboard
2. Go to **Cluster Settings** → **Endpoints**
3. Copy the **Bootstrap Server** endpoint
4. It should look like: `your-cluster.region.provider.confluent.cloud:9092`

## File Format Examples

### confluent-api-key.txt
```
ABC123DEF456GHI789
```

### confluent-api-secret.txt
```
xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890
```

### confluent-bootstrap.txt
```
pkc-12345.us-west-2.aws.confluent.cloud:9092
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit these files to version control**
   - Files in this directory are ignored by `.gitignore`
   - Keep credentials secure and private

2. **Use environment-specific credentials**
   - Different credentials for dev/staging/production
   - Rotate credentials regularly

3. **Principle of least privilege**
   - Use granular access controls when possible
   - Limit API key permissions to required operations

4. **Monitor usage**
   - Enable audit logging in Confluent Cloud
   - Monitor API key usage and access patterns

## Kong Event Gateway Configuration

These credentials will be used by Kong Event Gateway to:

1. **Authenticate** with Confluent Cloud Kafka clusters
2. **Produce messages** to Kafka topics
3. **Consume messages** from Kafka topics
4. **Manage topics** and consumer groups (if permissions allow)

## Configuration Integration

The Kong Event Gateway configuration (`config.yaml`) will reference these files:

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
```

## Environment Variables

The Docker Compose configuration will load these files as secrets:

```yaml
secrets:
  confluent_cloud_username:
    file: ./config/secrets/confluent-api-key.txt
  confluent_cloud_password:
    file: ./config/secrets/confluent-api-secret.txt
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify API key and secret are correct
   - Check if API key has required permissions
   - Ensure bootstrap server URL is correct

2. **Connection Timeout**
   - Verify network connectivity to Confluent Cloud
   - Check firewall rules and security groups
   - Confirm bootstrap server endpoint is reachable

3. **Permission Denied**
   - Review API key permissions in Confluent Cloud
   - Ensure key has access to required topics
   - Check ACLs and resource permissions

### Validation Commands

```bash
# Test connectivity to Confluent Cloud
kafkacat -b $(cat confluent-bootstrap.txt) \
  -X security.protocol=SASL_SSL \
  -X sasl.mechanism=PLAIN \
  -X sasl.username=$(cat confluent-api-key.txt) \
  -X sasl.password=$(cat confluent-api-secret.txt) \
  -L

# List topics
kafkacat -b $(cat confluent-bootstrap.txt) \
  -X security.protocol=SASL_SSL \
  -X sasl.mechanism=PLAIN \
  -X sasl.username=$(cat confluent-api-key.txt) \
  -X sasl.password=$(cat confluent-api-secret.txt) \
  -L | grep topic
```

## Support

For issues with:
- **Confluent Cloud**: Check [Confluent Documentation](https://docs.confluent.io/cloud/current/overview.html)
- **Kong Event Gateway**: See Kong Event Gateway documentation
- **This Demo**: Open an issue in the repository

## File Checklist

Before running the demo, ensure you have:

- [ ] `confluent-api-key.txt` - Contains your Confluent Cloud API key
- [ ] `confluent-api-secret.txt` - Contains your Confluent Cloud API secret  
- [ ] `confluent-bootstrap.txt` - Contains your Confluent Cloud bootstrap server
- [ ] Verified credentials work with Confluent Cloud
- [ ] Confirmed API key has required permissions
- [ ] Tested network connectivity to Confluent Cloud

Once these files are in place, you can proceed with running the Kong Event Gateway demo against Confluent Cloud.
