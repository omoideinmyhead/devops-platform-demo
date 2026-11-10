locals {
  tags = {
    project    = "devops-platform-demo"
    managed_by = "terraform"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "${var.prefix}-rg"
  location = var.location
  tags     = local.tags
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "${var.prefix}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.prefix
  kubernetes_version  = var.kubernetes_version

  # Free control plane (no uptime SLA): fine for a demo cluster
  sku_tier = "Free"

  default_node_pool {
    name       = "system"
    vm_size    = var.node_vm_size
    node_count = var.node_count
    # The default OS disk is 128 GB; a smaller disk is cheaper and plenty here
    os_disk_size_gb = 64

    # Match the defaults AKS applies on its own; leaving this block out makes
    # every plan try to remove them. Note: a surge node would exceed the
    # 4 vCPU quota, so upgrades are done by recreating the cluster instead.
    upgrade_settings {
      max_surge                     = "10%"
      drain_timeout_in_minutes      = 0
      node_soak_duration_in_minutes = 0
    }
  }

  # AKS manages its own identity; no service principal secrets to rotate
  identity {
    type = "SystemAssigned"
  }

  # Azure CNI Overlay: pods get IPs from a private overlay range, not from the VNet
  network_profile {
    network_plugin      = "azure"
    network_plugin_mode = "overlay"
  }

  tags = local.tags
}