output "event_gateway_id" {
  description = "Event Gateway ID"
  value       = module.event_gateway.event_gateway_id
}

output "event_gateway_name" {
  description = "Event Gateway name"
  value       = module.event_gateway.event_gateway_name
}

output "virtual_cluster_id" {
  description = "Virtual cluster ID"
  value       = module.event_gateway.virtual_cluster_id
}

output "backend_cluster_id" {
  description = "Backend cluster ID"
  value       = module.event_gateway.backend_cluster_id
}

output "data_plane_container_id" {
  description = "Data plane Docker container ID"
  value       = module.data_plane.container_id
}

output "data_plane_container_name" {
  description = "Data plane Docker container name"
  value       = module.data_plane.container_name
}
