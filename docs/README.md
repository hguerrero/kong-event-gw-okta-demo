# Documentation Overview

This directory contains documentation for the Kong Event Gateway demo.

## Quick Start

1. **[Setup Guide](setup.md)** - Step-by-step setup instructions
2. **[Environment Variables](environment-variables.md)** - Configuration reference
3. **[Configuration Guide](configuration.md)** - System architecture details

## Documentation Structure

| Document | Purpose |
|----------|---------|
| [Setup Guide](setup.md) | Step-by-step deployment instructions |
| [Environment Variables](environment-variables.md) | Configuration reference |
| [Configuration Guide](configuration.md) | Architecture and component details |

## Getting Started

1. Deploy KEG using Terraform (see main [README.md](../README.md))
2. Configure Okta application
3. Run the demo client

## Key Concepts

- **KEG (Kong Event Gateway)** - Deployed to Kong Konnect via Terraform
- **Virtual Cluster** - Logical partition with OAuth authentication
- **Demo Client** - React application for testing KEG
