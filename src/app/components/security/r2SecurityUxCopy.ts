/**
 * UXDR-5929 Round 2 — customer feedback applied to prototype copy and status labels.
 * Single source for security / auth / run-as terminology.
 */

/** Stored `runAs` value — platform-managed fleet identity (not a k8s ServiceAccount). */
export const RUN_AS_PLATFORM_VALUE = "Platform managed identity";

/** Stored `runAs` value for the signed-in user. */
export const RUN_AS_YOU_VALUE = "Personal (Adi Cluster Admin)";

export const RUN_AS_LABELS = {
  you: "You (your account)",
  platform: "Platform managed identity",
  platformShort: "Platform managed identity",
} as const;

/** Cluster provisioning — complete current step before asking the user to re-auth. */
export const CLUSTER_STATUS_PROVISIONING = "Provisioning";
export const CLUSTER_STATUS_FINISHING = "Finishing install";
/** User must approve on another device — distinct from background reconcile. */
export const CLUSTER_STATUS_ACTION_REQUIRED = "Action required";

export const runAsHelpIntro =
  "Who the platform acts as on the cluster. This affects audit logs, credentials, and whether work can continue without you.";

export const runAsHelpPersonal =
  "Uses your signed-in account. Long-running work finishes the current step, then may pause with Action required if your session expired.";

export const runAsHelpPlatform =
  "Uses a platform-managed identity with durable credentials. Work continues without re-prompting you for each cluster.";

export const signingRegistrySectionHelp =
  "Where verification public keys are discovered for signed changes. Separate from console sign-in (OIDC issuer / client ID above)—signing trust can use IdP claims or an external Git forge.";

export const deferIdpLabel = "Configure identity provider later";
export const deferIdpDescription =
  "Skip OIDC setup for now and use bundled credentials for evaluation. Connect your enterprise IdP before production.";

export type SmartphoneAuthContext = {
  /** e.g. Approve provisioning for my-cluster */
  headline: string;
  /** Short action label */
  actionLabel: string;
  /** Cluster or resource name */
  resourceName?: string;
};

export function buildClusterProvisionAuthContext(
  clusterName: string,
): SmartphoneAuthContext {
  return {
    headline: `Approve provisioning for ${clusterName}`,
    actionLabel: "Cluster provisioning",
    resourceName: clusterName,
  };
}

export function buildDeploymentAuthContext(
  actionLabel: string,
): SmartphoneAuthContext {
  return {
    headline: `Approve ${actionLabel.toLowerCase()}`,
    actionLabel,
  };
}
