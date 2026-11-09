variable "subscription_id" {
  description = "Azure subscription to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region. B-series v2 VMs are available to this subscription in swedencentral"
  type        = string
  default     = "swedencentral"
}

variable "prefix" {
  description = "Name prefix for all resources"
  type        = string
  default     = "tarot"
}

variable "node_vm_size" {
  description = "VM size for the node pool (2 vCPU, 8 GiB)"
  type        = string
  default     = "Standard_B2s_v2"
}

variable "node_count" {
  description = "Number of nodes. 2 x 2 vCPU uses the whole 4 vCPU free-trial quota"
  type        = number
  default     = 2
}

variable "kubernetes_version" {
  description = "Kubernetes version; null lets AKS pick its current default"
  type        = string
  default     = null
}

variable "argocd_chart_version" {
  description = "Version of the argo-cd Helm chart (https://github.com/argoproj/argo-helm/releases)"
  type        = string
  default     = "9.5.17"
}