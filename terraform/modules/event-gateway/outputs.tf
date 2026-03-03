output "event_gateway_id" {
  description = "Event Gateway ID"
  value       = konnect_event_gateway.this.id
}

output "event_gateway_name" {
  description = "Event Gateway name"
  value       = konnect_event_gateway.this.name
}

output "backend_cluster_id" {
  description = "Backend cluster ID (Confluent Cloud or Local)"
  value       = var.kafka_backend == "confluent" ? konnect_event_gateway_backend_cluster.confluent_cloud[0].id : konnect_event_gateway_backend_cluster.local[0].id
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
