terraform {
  required_version = ">= 1.0"

  required_providers {
    konnect = {
      source  = "kong/konnect"
      version = ">= 3.9.0"
    }
  }
}
