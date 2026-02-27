output "event_gateway_id" {
  description = "Event Gateway ID"
  value       = konnect_event_gateway.this.id
}

output "event_gateway_name" {
  description = "Event Gateway name"
  value       = konnect_event_gateway.this.name
}

output "backend_cluster_id" {
  description = "Confluent Cloud backend cluster ID"
  value       = konnect_event_gateway_backend_cluster.confluent_cloud.id
}

output "virtual_cluster_id" {
  description = "Virtual cluster ID"
  value       = konnect_event_gateway_virtual_cluster.team_confluent.id
}

output "internal_listener_id" {
  description = "Internal listener ID"
  value       = konnect_event_gateway_listener.internal.id
}

output "external_listener_id" {
  description = "External listener ID"
  value       = konnect_event_gateway_listener.external.id
}
