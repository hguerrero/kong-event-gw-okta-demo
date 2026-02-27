terraform {
  required_version = ">= 1.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
    konnect = {
      source  = "Kong/konnect"
      version = "3.9.0"
    }
  }
}

variable "konnect_region" {
  description = "Kong Konnect region (e.g., us)"
  type        = string
  default     = "us"
}

variable "konnect_domain" {
  description = "Kong Konnect domain (e.g., konghq.com)"
  type        = string
  default     = "konghq.com"
}

variable "event_gateway_id" {
  description = "Event Gateway ID from Konnect"
  type        = string
}

variable "image" {
  description = "Kong Event Gateway Docker image"
  type        = string
  default     = "kong/kong-event-gateway-dev:latest"
}

variable "port_range_start" {
  description = "Port range start for Kafka listeners"
  type        = number
  default     = 19092
}

variable "port_range_end" {
  description = "Port range end for Kafka listeners"
  type        = number
  default     = 19390
}

variable "api_port" {
  description = "HTTP API port"
  type        = number
  default     = 8080
}

variable "https_port" {
  description = "HTTPS API port"
  type        = number
  default     = 8443
}

variable "drain_duration" {
  description = "Drain duration for graceful shutdown"
  type        = string
  default     = "1s"
}

variable "log_flags" {
  description = "Log flags for observability"
  type        = string
  default     = "info"
}

variable "docker_network" {
  description = "Docker network name to join"
  type        = string
  default     = "kong-kafka-net"
}

variable "cert_common_name" {
  description = "Common name for the data plane certificate"
  type        = string
  default     = "event-gateway"
}

variable "cert_country" {
  description = "Country for the data plane certificate"
  type        = string
  default     = "US"
}

variable "cert_validity_period_hours" {
  description = "Validity period for the certificate in hours"
  type        = number
  default     = 8760
}

variable "kafka_username" {
  description = "Kafka cluster username (Confluent Cloud API Key)"
  type        = string
  sensitive   = true
}

variable "kafka_password" {
  description = "Kafka cluster password (Confluent Cloud API Secret)"
  type        = string
  sensitive   = true
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "tls_private_key" "keg_data_plane" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "keg_data_plane" {
  private_key_pem = tls_private_key.keg_data_plane.private_key_pem

  subject {
    common_name = var.cert_common_name
    country     = var.cert_country
  }

  validity_period_hours = var.cert_validity_period_hours

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

resource "local_file" "keg_data_plane_cert" {
  content         = tls_self_signed_cert.keg_data_plane.cert_pem
  filename        = "${path.module}/certs/tls.crt"
  file_permission = "0644"
}

resource "local_file" "keg_data_plane_key" {
  content         = tls_private_key.keg_data_plane.private_key_pem
  filename        = "${path.module}/certs/key.crt"
  file_permission = "0600"
}

resource "konnect_event_gateway_data_plane_certificate" "keg_data_plane_cert" {
  provider    = konnect
  certificate = tls_self_signed_cert.keg_data_plane.cert_pem
  gateway_id  = var.event_gateway_id
  name        = "KEG Data Plane Certificate"
}

resource "docker_network" "keg_network" {
  count  = var.docker_network != "" ? 1 : 0
  name   = var.docker_network
  driver = "bridge"
}

resource "docker_image" "keg" {
  name         = var.image
  keep_locally = true
}

resource "docker_container" "event_gateway" {
  image = docker_image.keg.image_id
  name  = "kong-event-gateway"

  dynamic "ports" {
    for_each = range(var.port_range_start, var.port_range_end)
    content {
      internal = ports.value
      external = ports.value
    }
  }

  ports {
    internal = var.api_port
    external = var.api_port
  }

  ports {
    internal = var.https_port
    external = var.https_port
  }

  env = [
    "KONNECT_REGION=${var.konnect_region}",
    "KONNECT_DOMAIN=${var.konnect_domain}",
    "KONNECT_GATEWAY_CLUSTER_ID=${var.event_gateway_id}",
    "KONNECT_CLIENT_CERT=${tls_self_signed_cert.keg_data_plane.cert_pem}",
    "KONNECT_CLIENT_KEY=${tls_private_key.keg_data_plane.private_key_pem}",
    "KAFKA_USERNAME=${var.kafka_username}",
    "KAFKA_PASSWORD=${var.kafka_password}",
    "KEG_RUNTIME_DRAIN_DURATION=${var.drain_duration}",
    "KEG__OBSERVABILITY__LOG_FLAGS=${var.log_flags}",
  ]

  networks_advanced {
    name = var.docker_network != "" ? docker_network.keg_network[0].id : null
  }

  labels {
    label = "kong.event_gateway.id"
    value = var.event_gateway_id
  }

  healthcheck {
    test     = ["CMD", "curl", "-f", "http://localhost:${var.api_port}/health/probes/liveness"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }

  must_run = true
  restart  = "unless-stopped"

  depends_on = [
    konnect_event_gateway_data_plane_certificate.keg_data_plane_cert
  ]
}

output "container_id" {
  description = "Docker container ID"
  value       = docker_container.event_gateway.id
}

output "container_name" {
  description = "Docker container name"
  value       = docker_container.event_gateway.name
}

output "certificate_id" {
  description = "Data plane certificate ID in Konnect"
  value       = konnect_event_gateway_data_plane_certificate.keg_data_plane_cert.id
}
