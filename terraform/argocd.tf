# Installs Argo CD into the cluster
resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_chart_version
  namespace        = "argocd"
  create_namespace = true

  values = [yamlencode({
    # Dex provides SSO login; not needed here, so skip it to save resources
    dex = { enabled = false }
  })]
}

# Creates the "root" Application (app of apps). It points Argo CD at the argocd/
# directory in this repo, so every Application defined there (tarot, monitoring)
# is created and kept in sync from Git. Installed as a separate release because
# the Application CRD only exists after the argo-cd chart is installed.
resource "helm_release" "argocd_bootstrap" {
  name      = "argocd-bootstrap"
  chart     = "${path.module}/charts/argocd-bootstrap"
  namespace = "argocd"

  depends_on = [helm_release.argocd]
}