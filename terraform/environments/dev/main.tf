terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

module "event_gateway" {
  source = "../../modules/event-gateway"

  name        = var.event_gateway_name
  description = var.event_gateway_description

  confluent_cluster_name        = var.confluent_cluster_name
  confluent_cluster_description = var.confluent_cluster_description
  bootstrap_servers             = var.bootstrap_servers
  allow_anonymous_auth          = var.allow_anonymous_auth

  virtual_cluster_name        = var.virtual_cluster_name
  virtual_cluster_description = var.virtual_cluster_description
  virtual_cluster_dns_label   = var.virtual_cluster_dns_label
  virtual_cluster_acl_mode    = var.virtual_cluster_acl_mode

  okta_jwks_endpoint    = var.okta_jwks_endpoint
  jwks_timeout          = var.jwks_timeout
  jwks_cache_expiration = var.jwks_cache_expiration

  internal_listener_name        = var.internal_listener_name
  internal_listener_description = var.internal_listener_description
  internal_listener_addresses   = var.internal_listener_addresses
  internal_listener_ports       = var.internal_listener_ports

  external_listener_name        = var.external_listener_name
  external_listener_description = var.external_listener_description
  external_listener_addresses   = var.external_listener_addresses
  external_listener_ports       = var.external_listener_ports

  listener_policy_name        = var.listener_policy_name
  listener_policy_description = var.listener_policy_description
  advertised_host             = var.advertised_host
}

module "data_plane" {
  source = "../../modules/data-plane"

  event_gateway_id = module.event_gateway.event_gateway_id

  kafka_username = var.kafka_username
  kafka_password = var.kafka_password

  port_range_start = var.port_range_start
  port_range_end   = var.port_range_end
  api_port         = var.api_port
  https_port       = var.https_port

  drain_duration = var.drain_duration
  log_flags      = var.log_flags
  docker_network = var.docker_network
}
