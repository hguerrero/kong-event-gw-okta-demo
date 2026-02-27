variable "konnect_token" {
  description = "Kong Konnect Personal Access Token"
  type        = string
  sensitive   = true
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

variable "konnect_server_url" {
  description = "Kong Konnect API URL"
  type        = string
  default     = "https://us.api.konghq.com"
}

variable "event_gateway_name" {
  description = "Event Gateway name"
  type        = string
  default     = "kong-event-gw-okta-demo"
}

variable "event_gateway_description" {
  description = "Event Gateway description"
  type        = string
  default     = "Event Gateway for Okta and Confluent Cloud demo"
}

variable "confluent_cluster_name" {
  description = "Confluent Cloud cluster name"
  type        = string
  default     = "confluent-cloud"
}

variable "confluent_cluster_description" {
  description = "Confluent Cloud cluster description"
  type        = string
  default     = "Confluent Cloud Cluster"
}

variable "bootstrap_servers" {
  description = "Confluent Cloud Bootstrap Servers"
  type        = list(string)
}

variable "allow_anonymous_auth" {
  description = "Allow anonymous virtual cluster authentication"
  type        = bool
  default     = true
}

variable "virtual_cluster_name" {
  description = "Virtual cluster name"
  type        = string
  default     = "virtual-cluster"
}

variable "virtual_cluster_description" {
  description = "Virtual cluster description"
  type        = string
  default     = "team virtual cluster"
}

variable "virtual_cluster_dns_label" {
  description = "Virtual cluster DNS label"
  type        = string
  default     = "virtual"
}

variable "virtual_cluster_acl_mode" {
  description = "Virtual cluster ACL mode"
  type        = string
  default     = "enforce_on_gateway"
}

variable "okta_jwks_endpoint" {
  description = "Okta JWKS endpoint for OAuth Bearer"
  type        = string
}

variable "jwks_timeout" {
  description = "JWKS timeout"
  type        = string
  default     = "1s"
}

variable "jwks_cache_expiration" {
  description = "JWKS cache expiration"
  type        = string
  default     = "1h"
}

variable "internal_listener_name" {
  description = "Internal listener name"
  type        = string
  default     = "internal"
}

variable "internal_listener_description" {
  description = "Internal listener description"
  type        = string
  default     = "listener for internal clients"
}

variable "internal_listener_addresses" {
  description = "Internal listener addresses"
  type        = list(string)
  default     = ["0.0.0.0"]
}

variable "internal_listener_ports" {
  description = "Internal listener ports"
  type        = list(string)
  default     = ["19092-19192"]
}

variable "external_listener_name" {
  description = "External listener name"
  type        = string
  default     = "localhost"
}

variable "external_listener_description" {
  description = "External listener description"
  type        = string
  default     = "listener for external clients"
}

variable "external_listener_addresses" {
  description = "External listener addresses"
  type        = list(string)
  default     = ["0.0.0.0"]
}

variable "external_listener_ports" {
  description = "External listener ports"
  type        = list(string)
  default     = ["29092-29192"]
}

variable "listener_policy_name" {
  description = "Listener policy name"
  type        = string
  default     = "internal listener policy"
}

variable "listener_policy_description" {
  description = "Listener policy description"
  type        = string
  default     = "forward to vcluster policy"
}

variable "advertised_host" {
  description = "Advertised host for port mapping"
  type        = string
  default     = "localhost"
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
