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

This demo showcases a modern event-driven architecture with secure authentication and event streaming capabilities.

```mermaid
graph TB
    %% User and Client Layer
    User[👤 User] --> DemoClient[🌐 Demo Client<br/>React + TypeScript]

    %% Authentication Flow
    DemoClient --> Okta[🔐 Okta<br/>Identity Provider]
    Okta --> DemoClient

    %% API Gateway Layer
    DemoClient --> APIServer[🚀 Node.js API Server<br/>Express + OAuth Middleware]

    %% Kong Native Event Proxy Layer
    APIServer --> KNEP[⚡ Kong Native Event Proxy<br/>KNEP Virtual Cluster]

    %% Kafka Cluster
    KNEP --> Kafka1[📊 Kafka Broker 1<br/>Port 9092]
    KNEP --> Kafka2[📊 Kafka Broker 2<br/>Port 9093]
    KNEP --> Kafka3[📊 Kafka Broker 3<br/>Port 9094]

    %% Kong Konnect Management
    KNEP --> KongKonnect[☁️ Kong Konnect<br/>Control Plane]

    %% Data Flow Annotations
    DemoClient -.->|"1. OIDC Login"| Okta
    Okta -.->|"2. JWT Token"| DemoClient
    DemoClient -.->|"3. API Calls + Bearer Token"| APIServer
    APIServer -.->|"4. Token Validation"| Okta
    APIServer -.->|"5. Kafka Operations<br/>SASL OAuth Bearer"| KNEP
    KNEP -.->|"6. Topic/Message Queries"| Kafka1

    %% Styling
    classDef userLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef authLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef appLayer fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef proxyLayer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef kafkaLayer fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef mgmtLayer fill:#e0f2f1,stroke:#004d40,stroke-width:2px

    class User,DemoClient userLayer
    class Okta authLayer
    class APIServer appLayer
    class KNEP proxyLayer
    class Kafka1,Kafka2,Kafka3,ZK kafkaLayer
    class KongKonnect mgmtLayer
```

### Component Details

| Component | Purpose | Technology | Port |
|-----------|---------|------------|------|
| **Demo Client** | Web UI for Kafka topic browsing | React + TypeScript + Material-UI | 3000 |
| **API Server** | Backend API with OAuth validation | Node.js + Express + Okta SDK | 3001 |
| **Okta** | Identity Provider & OAuth Server | Okta Cloud Service | - |
| **KNEP** | Event Gateway & Kafka Proxy | Kong Native Event Proxy | 19092 |
| **Kafka Cluster** | Event Streaming Platform | Apache Kafka (3 brokers) | 9092-9094 |
| **Kong Konnect** | Control Plane Management | Kong Konnect Cloud | - |

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant DC as Demo Client
    participant O as Okta
    participant API as API Server
    participant K as KNEP
    participant KF as Kafka

    U->>DC: 1. Access Application
    DC->>O: 2. Redirect to Okta Login
    U->>O: 3. Enter Credentials
    O->>DC: 4. Return JWT Token
    DC->>API: 5. API Call with Bearer Token
    API->>O: 6. Validate Token (JWKS)
    O->>API: 7. Token Valid Response
    API->>K: 8. Kafka Request (SASL OAuth Bearer)
    K->>O: 9. Validate OAuth Token
    O->>K: 10. Token Valid
    K->>KF: 11. Execute Kafka Operation
    KF->>K: 12. Return Data
    K->>API: 13. Return Response
    API->>DC: 14. Return JSON Response
    DC->>U: 15. Display Results
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Client Tier"
        A[React App<br/>Port 3000]
    end

    subgraph "API Tier"
        B[Express Server<br/>Port 3001]
    end

    subgraph "Identity Tier"
        C[Okta OIDC<br/>Cloud Service]
    end

    subgraph "Event Gateway Tier"
        D[KNEP Virtual Cluster<br/>Port 19092]
    end

    subgraph "Event Streaming Tier"
        E1[Kafka Broker 1<br/>Port 9092]
        E2[Kafka Broker 2<br/>Port 9093]
        E3[Kafka Broker 3<br/>Port 9094]
    end

    subgraph "Management Tier"
        F[Kong Konnect<br/>Control Plane]
    end

    A <-->|HTTP/HTTPS<br/>OAuth Flow| C
    A <-->|REST API<br/>Bearer Token| B
    B <-->|Token Validation<br/>JWKS| C
    B <-->|Kafka Protocol<br/>SASL OAuth| D
    D <-->|Topic Operations<br/>Message Queries| E1
    D <-->|Topic Operations<br/>Message Queries| E2
    D <-->|Topic Operations<br/>Message Queries| E3
    D <-->|Configuration<br/>Monitoring| F

    classDef client fill:#e3f2fd,stroke:#1976d2
    classDef api fill:#f1f8e9,stroke:#388e3c
    classDef auth fill:#fce4ec,stroke:#c2185b
    classDef gateway fill:#fff8e1,stroke:#f57c00
    classDef kafka fill:#f3e5f5,stroke:#7b1fa2
    classDef mgmt fill:#e0f2f1,stroke:#00695c

    class A client
    class B api
    class C auth
    class D gateway
    class E1,E2,E3,Z kafka
    class F mgmt
```

### Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Authentication Layer"
            OIDC[🔐 OpenID Connect<br/>Okta Provider]
            JWT[🎫 JWT Tokens<br/>Bearer Authentication]
        end

        subgraph "Authorization Layer"
            RBAC[👥 Role-Based Access<br/>Okta Groups & Claims]
            SASL[🔒 SASL OAuth Bearer<br/>Kafka Authentication]
        end

        subgraph "Transport Security"
            TLS[🛡️ TLS Encryption<br/>HTTPS/SSL]
            MTLS[🔐 Mutual TLS<br/>Service-to-Service]
        end

        subgraph "Network Security"
            CORS[🌐 CORS Policies<br/>Cross-Origin Control]
            FW[🚧 Network Isolation<br/>Docker Networks]
        end
    end

    OIDC --> JWT
    JWT --> RBAC
    RBAC --> SASL
    TLS --> MTLS
    CORS --> FW

    classDef security fill:#ffebee,stroke:#c62828,stroke-width:2px
    class OIDC,JWT,RBAC,SASL,TLS,MTLS,CORS,FW security
```

### Network Topology

```mermaid
graph TB
    subgraph "External Network"
        Internet[🌐 Internet]
        OktaCloud[☁️ Okta Cloud]
        KonnectCloud[☁️ Kong Konnect]
    end

    subgraph "Docker Network: kong-kafka-net"
        subgraph "Frontend Services"
            DemoApp[Demo Client<br/>:3000]
        end

        subgraph "Backend Services"
            APIGateway[API Server<br/>:3001]
        end

        subgraph "Event Gateway"
            KNEP[KNEP Proxy<br/>:19092]
        end

        subgraph "Kafka Cluster"
            K1[Kafka-1<br/>:9092]
            K2[Kafka-2<br/>:9093]
            K3[Kafka-3<br/>:9094]
        end
    end

    Internet --> DemoApp
    DemoApp --> OktaCloud
    DemoApp --> APIGateway
    APIGateway --> OktaCloud
    APIGateway --> KNEP
    KNEP --> KonnectCloud
    KNEP --> K1
    KNEP --> K2
    KNEP --> K3

    classDef external fill:#e8eaf6,stroke:#3f51b5
    classDef frontend fill:#e1f5fe,stroke:#0277bd
    classDef backend fill:#e8f5e8,stroke:#2e7d32
    classDef gateway fill:#fff3e0,stroke:#f57c00
    classDef kafka fill:#fce4ec,stroke:#c2185b

    class Internet,OktaCloud,KonnectCloud external
    class DemoApp frontend
    class APIGateway backend
    class KNEP gateway
    class K1,K2,K3,ZK kafka
```

### Key Architectural Benefits

| Benefit | Description | Implementation |
|---------|-------------|----------------|
| **🔐 Zero Trust Security** | Every request authenticated & authorized | Okta OIDC + SASL OAuth Bearer |
| **⚡ Event Gateway Pattern** | Unified API for event streaming | Kong Native Event Proxy (KNEP) |
| **🏗️ Microservices Ready** | Loosely coupled, independently deployable | Docker containers + REST APIs |
| **📈 Horizontal Scalability** | Scale components independently | Multi-broker Kafka + Load balancing |
| **🛡️ Defense in Depth** | Multiple security layers | TLS + OAuth + RBAC + Network isolation |
| **🔄 Event-Driven Architecture** | Asynchronous, resilient communication | Kafka topics + Event sourcing patterns |
| **☁️ Cloud Native** | Container-first, orchestration ready | Docker Compose + Kubernetes ready |
| **🎯 Developer Experience** | Modern tooling & type safety | TypeScript + Material-UI + Hot reload |

### Design Decisions

#### **Why Kong Native Event Proxy (KNEP)?**
- **Unified API Surface**: Single gateway for both REST APIs and event streams
- **Enterprise Security**: OAuth Bearer token validation for Kafka access
- **Operational Simplicity**: Centralized monitoring, logging, and policy enforcement
- **Developer Productivity**: Familiar HTTP semantics for event streaming operations

#### **Why Okta for Identity?**
- **Enterprise Grade**: Production-ready identity and access management
- **Standards Compliant**: Full OpenID Connect and OAuth 2.0 support
- **Rich Ecosystem**: Extensive integrations and developer tools
- **Security First**: Advanced threat protection and compliance features

## Prerequisites

- Docker and Docker Compose
- Okta Account
- Kong Konnect Account (for KNEP)
- Basic understanding of Kafka and OAuth 2.0

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hguerrero/kong-event-gw-okta-demo.git
   cd kong-event-gw-okta-demo
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update with your Okta and Kong Konnect credentials
   - See [Environment Variables Guide](docs/environment-variables.md) for detailed configuration

3. **Start the environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the demo client application**
   
   ```bash
   http://localhost:3000
   ```

## Repository Structure

```
├── README.md                 # This file
├── docker-compose.yml        # Main Docker Compose configuration
├── .env.example              # Environment variables template
├── config/                   # Configuration files
│   ├── kong/                 # Kong Native Event Proxy configuration
│   │   └── config.yaml       # KNEP virtual cluster configuration
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For questions and support:
- Check the [troubleshooting guide](docs/troubleshooting.md)
- Open an issue in this repository
- Refer to the official Kong and Okta documentation
