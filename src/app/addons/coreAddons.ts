export type CoreAddonId =
  | "configuration"
  | "virtualization"
  | "governance"
  | "security"
  | "observability";

export const OPENSHIFT_PLATFORM_PLUS_URL =
  "https://www.redhat.com/en/technologies/cloud-computing/openshift/platform-plus";

export type CoreAddonContent = {
  id: CoreAddonId;
  /** Add-on product name (nav label and settings). */
  name: string;
  description: string;
  learnMoreUrl: string;
  /** Optional label for the documentation link (defaults to "Learn more"). */
  learnMoreLabel?: string;
  /** Cluster admin: subscription upgrade required to install. */
  upgradeMessage?: string;
  /** Cluster admin primary action label when upgrade is required. */
  ctaLabel?: string;
  /** SecOps: ask administrator to enable (Virtualization). */
  secOpsPermissionMessage?: string;
  /** SecOps: ask administrator to upgrade (Security). */
  secOpsUpgradeMessage?: string;
};

export const CORE_ADDONS: Record<CoreAddonId, CoreAddonContent> = {
  configuration: {
    id: "configuration",
    name: "Configuration",
    description:
      "Deploy and manage applications across your OpenShift fleet using GitOps and Helm. Keep workloads consistent as you scale from a single cluster to many.",
    learnMoreUrl:
      "https://www.redhat.com/en/technologies/cloud-computing/openshift/gitops",
  },
  virtualization: {
    id: "virtualization",
    name: "Virtualization",
    description:
      "Run and manage virtual machines alongside containers. Handle VM lifecycle, migration, and storage from the same management console you use for your cluster fleet.",
    learnMoreUrl:
      "https://www.redhat.com/en/technologies/cloud-computing/openshift/virtualization",
    secOpsPermissionMessage: "Ask your administrator to enable this add-on.",
  },
  governance: {
    id: "governance",
    name: "Governance",
    description:
      "Define and enforce policies across clusters. Monitor violations and remediate drift before it affects production workloads.",
    learnMoreUrl:
      "https://www.redhat.com/en/technologies/management/advanced-cluster-management",
  },
  security: {
    id: "security",
    name: "Security",
    description:
      "Monitor security posture, vulnerability findings, and compliance status across your fleet. Centralize security insights so teams can prioritize and act on risks quickly.",
    learnMoreUrl:
      "https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes",
    upgradeMessage:
      "This add-on requires OpenShift Platform Plus. Upgrade your subscription to install.",
    ctaLabel: "Start upgrade process",
    learnMoreLabel: "Learn more about Security",
    secOpsUpgradeMessage:
      "This add-on requires OpenShift Platform Plus. Ask your administrator to upgrade your subscription.",
  },
  observability: {
    id: "observability",
    name: "Observability",
    description:
      "Collect metrics, logs, and traces from your clusters. Gain fleet-wide visibility to monitor health and troubleshoot issues without switching between individual cluster consoles.",
    learnMoreUrl:
      "https://www.redhat.com/en/technologies/cloud-computing/openshift/container-platform",
  },
};

export type AddonLandingView = {
  titleText: string;
  description: string;
  secondaryMessage?: string;
  learnMoreUrl: string;
  learnMoreLabel?: string;
  ctaLabel?: string;
  showCta: boolean;
  learnMoreInline: boolean;
  ctaHref?: string;
};

export function getAddonLandingView(
  addon: CoreAddonContent,
  isSecOps: boolean,
): AddonLandingView {
  const titleText = `Install the ${addon.name} add-on`;

  if (isSecOps && addon.id === "security") {
    return {
      titleText,
      description: addon.description,
      secondaryMessage: addon.secOpsUpgradeMessage,
      learnMoreUrl: addon.learnMoreUrl,
      learnMoreLabel: addon.learnMoreLabel,
      showCta: false,
      learnMoreInline: false,
    };
  }

  if (isSecOps && addon.id === "virtualization") {
    return {
      titleText,
      description: addon.description,
      secondaryMessage: addon.secOpsPermissionMessage,
      learnMoreUrl: addon.learnMoreUrl,
      showCta: false,
      learnMoreInline: false,
    };
  }

  const isSecurityUpgrade = !isSecOps && addon.id === "security";

  return {
    titleText,
    description: addon.description,
    secondaryMessage: addon.upgradeMessage,
    learnMoreUrl: addon.learnMoreUrl,
    learnMoreLabel: addon.learnMoreLabel,
    ctaLabel: addon.ctaLabel ?? "Install",
    showCta: true,
    learnMoreInline: false,
    ctaHref: isSecurityUpgrade ? OPENSHIFT_PLATFORM_PLUS_URL : undefined,
  };
}
