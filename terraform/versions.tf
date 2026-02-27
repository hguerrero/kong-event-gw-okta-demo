terraform {
  required_version = ">= 1.0"

  required_providers {
    konnect = {
      source  = "Kong/konnect"
      version = "3.9.0"
    }
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
  }
}
