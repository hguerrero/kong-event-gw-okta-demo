resource "konnect_event_gateway" "this" {
  provider    = konnect
  name        = var.name
  description = var.description
}

resource "konnect_event_gateway_backend_cluster" "confluent_cloud" {
  provider          = konnect
  gateway_id        = konnect_event_gateway.this.id
  name              = var.confluent_cluster_name
  description       = var.confluent_cluster_description
  bootstrap_servers = var.bootstrap_servers
  authentication = {
    sasl_plain = {
      username = "$${env['KAFKA_USERNAME']}"
      password = "$${env['KAFKA_PASSWORD']}"
    }
  }
  tls = {
    enabled = true
  }
  insecure_allow_anonymous_virtual_cluster_auth = var.allow_anonymous_auth
  depends_on                                    = [konnect_event_gateway.this]
}

resource "konnect_event_gateway_virtual_cluster" "team_confluent" {
  provider    = konnect
  gateway_id  = konnect_event_gateway.this.id
  name        = var.virtual_cluster_name
  description = var.virtual_cluster_description
  destination = {
    id = konnect_event_gateway_backend_cluster.confluent_cloud.id
  }
  dns_label = var.virtual_cluster_dns_label
  acl_mode  = var.virtual_cluster_acl_mode
  authentication = [{
    oauth_bearer = {
      jwks = {
        endpoint         = var.okta_jwks_endpoint
        timeout          = var.jwks_timeout
        cache_expiration = var.jwks_cache_expiration
      }
      mediation = "terminate"
    }
  }]
}

resource "konnect_event_gateway_listener" "internal" {
  provider    = konnect
  gateway_id  = konnect_event_gateway.this.id
  description = var.internal_listener_description
  name        = var.internal_listener_name
  addresses   = var.internal_listener_addresses
  ports       = var.internal_listener_ports
}

resource "konnect_event_gateway_listener" "external" {
  provider    = konnect
  gateway_id  = konnect_event_gateway.this.id
  description = var.external_listener_description
  name        = var.external_listener_name
  addresses   = var.external_listener_addresses
  ports       = var.external_listener_ports
}

resource "konnect_event_gateway_listener_policy_forward_to_virtual_cluster" "internal_forward" {
  provider    = konnect
  gateway_id  = konnect_event_gateway.this.id
  name        = var.listener_policy_name
  description = var.listener_policy_description
  listener_id = konnect_event_gateway_listener.internal.id

  config = {
    port_mapping = {
      advertised_host = var.advertised_host
      bootstrap_port  = "none"
      destination = {
        id = konnect_event_gateway_virtual_cluster.team_confluent.id
      }
    }
  }
}

resource "konnect_event_gateway_listener_policy_forward_to_virtual_cluster" "external_forward" {
  provider    = konnect
  gateway_id  = konnect_event_gateway.this.id
  name        = var.external_listener_policy_name
  description = var.external_listener_policy_description
  listener_id = konnect_event_gateway_listener.external.id

  config = {
    port_mapping = {
      advertised_host = var.external_advertised_host
      bootstrap_port  = "none"
      destination = {
        id = konnect_event_gateway_virtual_cluster.team_confluent.id
      }
    }
  }
}

resource "konnect_event_gateway_cluster_policy_acls" "acl_policy" {
  provider           = konnect
  name               = "acl_policy_read"
  description        = "ACL policy for ensuring access to topics"
  gateway_id         = konnect_event_gateway.this.id
  virtual_cluster_id = konnect_event_gateway_virtual_cluster.team_confluent.id

  config = {
    rules = [
      {
        action = "allow"
        operations = [
          { name = "describe" },
          { name = "read" },
        ]
        resource_type = "topic"
        resource_names = [{
          match = "internal-*"
        }]
      }
    ]
  }
}