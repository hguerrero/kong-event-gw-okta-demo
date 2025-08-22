# Kong Event Gateway + Okta OAuth Demo

This repository demonstrates how to configure Kong Event Gateway to mediate authentication to a Kafka cluster using OAuth with Okta as the identity provider.

## Overview

This demo showcases:
- Kong Native Event Proxy (KNEP) configuration for Kafka integration
- Okta OAuth 2.0 authentication with SASL OAuth Bearer
- Multi-broker Kafka cluster setup
- Virtual cluster configuration with topic prefixing
- Docker-based local development environment

## Architecture

```
Client Application
       ↓ (OAuth Token)
Kong Native Event Proxy (KNEP)
       ↓ (SASL OAuth Bearer)
3-Node Kafka Cluster
```

## Prerequisites

- Docker and Docker Compose
- Okta Account
- Kong Konnect Account (for KNEP)
- Basic understanding of Kafka and OAuth 2.0

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kong-event-gw-okta-demo
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update with your Okta and Kong Konnect credentials

3. **Start the environment**
   ```bash
   docker-compose up -d
   ```

4. **Run the demo**
   ```bash
   ./scripts/demo.sh
   ```

## Repository Structure

```
├── README.md                 # This file
├── docker-compose.yml        # Main Docker Compose configuration
├── .env.example              # Environment variables template
├── config/                   # Configuration files
│   ├── kong/                 # Kong Native Event Proxy configuration
│   │   └── config.yaml       # KNEP virtual cluster configuration
│   ├── okta/                 # Okta OAuth configuration
│   └── certs/                # TLS certificates (if needed)
├── scripts/                  # Demo and utility scripts
├── examples/                 # Example client applications
├── demo-client/              # Demo web application
└── docs/                     # Additional documentation
```

## Configuration

### Kong Native Event Proxy (KNEP)
- Virtual cluster configuration in `config/kong/config.yaml`
- SASL OAuth Bearer authentication
- Topic prefixing and routing
- Multi-broker Kafka cluster support

### Okta OAuth
- OAuth 2.0 application setup
- JWKS endpoint configuration
- Token validation with SASL OAuth Bearer

### Kafka Cluster
- 3-node Kafka cluster with KRaft mode
- Internal and external listeners
- Topic partitioning and replication

## Usage

Detailed usage instructions can be found in the [docs/](docs/) directory:
- [Setup Guide](docs/setup.md)
- [Configuration Reference](docs/configuration.md)
- [Troubleshooting](docs/troubleshooting.md)

## Examples

The `examples/` directory contains sample client applications demonstrating:
- OAuth token acquisition
- Event publishing through Kong Native Event Proxy
- Kafka cluster interaction with virtual clusters
- Topic prefixing and routing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Check the [troubleshooting guide](docs/troubleshooting.md)
- Open an issue in this repository
- Refer to the official Kong and Okta documentation
