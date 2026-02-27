terraform {
  required_version = ">= 1.0"
}

variable "konnect_token" {
  description = "Kong Konnect Personal Access Token"
  type        = string
  sensitive   = true
}

variable "konnect_server_url" {
  description = "Kong Konnect API URL"
  type        = string
  default     = "https://us.api.konghq.com"
}

provider "konnect" {
  personal_access_token = var.konnect_token
  server_url            = var.konnect_server_url
}
