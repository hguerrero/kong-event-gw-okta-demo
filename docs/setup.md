# Setup Guide

This guide walks you through setting up the Kong Event Gateway (KEG) demo with Okta OAuth and the demo client application.

## Prerequisites

### Required Software
- Docker (version 20.10+) - for running the demo client
- Terraform (version 1.0+) - for deploying KEG to Kong Konnect
- curl or similar HTTP client
- jq (for JSON processing in scripts)

### Okta Account
1. Sign up for a free Okta Developer account at https://developer.okta.com/
2. Create a new application in your Okta dashboard

### Kong Konnect Account
1. Sign up for Kong Konnect at https://konghq.com/
2. Get your Personal Access Token

### Confluent Cloud Account
1. Sign up for Confluent Cloud at https://confluent.cloud/
2. Create a Kafka cluster and get bootstrap servers
3. Create an API key and secret

## Step 1: Okta Application Setup

### Create OAuth Application
1. Log into your Okta Developer Console
2. Navigate to **Applications** > **Applications**
3. Click **Create App Integration**
4. Select **OIDC - OpenID Connect**
5. Choose **Single Page Application**
6. Configure the application:
   - **App integration name**: Kong Event Gateway Demo
   - **Grant type**: Authorization Code, Client Credentials
   - **Sign-in redirect URIs**: `http://localhost:3000/auth/callback`
   - **Sign-out redirect URIs**: `http://localhost:3000/logout`
   - **Controlled access**: Allow everyone in your organization to access

### Note Application Credentials
After creating the application, note down:
- Client ID
- Okta Domain
- Issuer URL (typically `https://your-domain.okta.com`)

## Step 2: Deploy KEG with Terraform

Follow the instructions in the main [README.md](../README.md#deploying-with-terraform) to deploy KEG to Kong Konnect.

## Step 3: Run the Demo Client

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Update the configuration** with your credentials:
   ```bash
   # Okta Configuration
   OKTA_CLIENT_ID=your_okta_client_id_here
   OKTA_ISSUER=https://your-domain.okta.com

   # Kafka Configuration
   # Use the KEG virtual cluster endpoint from Konnect
   KAFKA_BOOTSTRAP=your-keg-endpoint:19092
   ```

3. **Start the demo client**:
   ```bash
   docker-compose up -d demo-client
   ```

4. **Access the demo client**:
   Open http://localhost:3000 in your browser
