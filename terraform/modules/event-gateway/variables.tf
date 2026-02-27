variable "name" {
  description = "Event Gateway name"
  type        = string
}

variable "description" {
  description = "Event Gateway description"
  type        = string
  default     = ""
}

variable "confluent_cluster_name" {
  description = "Confluent Cloud cluster name"
  type        = string
}

variable "confluent_cluster_description" {
  description = "Confluent Cloud cluster description"
  type        = string
  default     = ""
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
}

variable "virtual_cluster_description" {
  description = "Virtual cluster description"
  type        = string
  default     = ""
}

variable "virtual_cluster_dns_label" {
  description = "Virtual cluster DNS label"
  type        = string
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
}

variable "internal_listener_description" {
  description = "Internal listener description"
  type        = string
  default     = ""
}

variable "internal_listener_addresses" {
  description = "Internal listener addresses"
  type        = list(string)
  default     = ["0.0.0.0"]
}

variable "internal_listener_ports" {
  description = "Internal listener ports"
  type        = list(string)
}

variable "external_listener_name" {
  description = "External listener name"
  type        = string
}

variable "external_listener_description" {
  description = "External listener description"
  type        = string
  default     = ""
}

variable "external_listener_addresses" {
  description = "External listener addresses"
  type        = list(string)
  default     = ["0.0.0.0"]
}

variable "external_listener_ports" {
  description = "External listener ports"
  type        = list(string)
}

variable "listener_policy_name" {
  description = "Listener policy name"
  type        = string
}

variable "listener_policy_description" {
  description = "Listener policy description"
  type        = string
  default     = ""
}

variable "advertised_host" {
  description = "Advertised host for port mapping"
  type        = string
}

variable "external_listener_policy_name" {
  description = "External listener policy name"
  type        = string
  default     = "external listener policy"
}

variable "external_listener_policy_description" {
  description = "External listener policy description"
  type        = string
  default     = "forward to vcluster policy"
}

variable "external_advertised_host" {
  description = "Advertised host for external listener port mapping"
  type        = string
  default     = "localhost"
}
