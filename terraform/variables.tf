variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "service_name" {
  type    = string
  default = "workflow-platform"
}

variable "image" {
  type        = string
  description = "Docker image URL (Artifact Registry or GCR)"
}