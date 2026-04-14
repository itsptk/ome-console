import { useState } from "react";
import { Link } from "react-router";
import {
  CardTitle,
  SmallText,
  TinyText,
  PrimaryButton,
  SecondaryButton,
} from "../../../imports/UIComponents";
import { MockQrBlock } from "../signing/PasskeyEnrollmentMock";
import { isPasskeyEnrollmentComplete } from "../../signing/signingPrototypeState";
import { readDayOneConsoleConfig } from "../../pages/day-one/dayOneConsoleConfig";

/** Passkey enrollment UI in Settings exists for the external GitHub signing path (prototype). */
function shouldRequireSettingsPasskeyEnrollment(): boolean {
  const c = readDayOneConsoleConfig();
  return (
    c?.signingKeyRegistry === "external" && c?.externalRegistryProvider === "github"
  );
}

export type PlatformSigningPhase =
  | "settings-required"
  | "authorize"
  | "qr-authorize"
  | "success";

interface PlatformSigningFlowProps {
  clusterName: string;
  onComplete: () => void;
  onCancel: () => void;
}

const SIGNING_PERMISSIONS: { label: string; icon: "stack" | "rocket" | "eye" | "gear" }[] =
  [
    {
      label: "Approve provisioning request for this cluster",
      icon: "stack",
    },
    {
      label: "Submit signed manifests to the management plane",
      icon: "rocket",
    },
    {
      label: "Allow the platform agent to verify your signature",
      icon: "eye",
    },
    {
      label: "Bind this approval to the current deployment only",
      icon: "gear",
    },
  ];

function PermIcon({ kind }: { kind: (typeof SIGNING_PERMISSIONS)[0]["icon"] }) {
  const common = { className: "size-5 flex-shrink-0", strokeWidth: 1.5 as const };
  switch (kind) {
    case "stack":
      return (
        <svg {...common} fill="none" viewBox="0 0 20 20" style={{ color: "var(--muted-foreground)" }}>
          <path d="M3 7l7 4 7-4M3 12l7 4 7-4" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...common} fill="none" viewBox="0 0 20 20" style={{ color: "var(--muted-foreground)" }}>
          <path d="M4 12l8-8 4 4-8 8H4v-4z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common} fill="none" viewBox="0 0 20 20" style={{ color: "var(--muted-foreground)" }}>
          <ellipse cx="10" cy="10" rx="6" ry="4" stroke="currentColor" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common} fill="none" viewBox="0 0 20 20" style={{ color: "var(--muted-foreground)" }}>
          <path
            d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15.2 10l1.2.7-.3 1.4-1.4.2-.9 1.2-1.5-.5-1.3.8-.1 1.4-1.4.5-1.2-1-1.4.1-1-1.2.5-1.5-.8-1.3-1.4-.1-.5-1.4 1-1.2-.1-1.4 1.2-1 .8-1.3.5-1.5 1.4-.1.5-1.4 1.2 1 1.4-.1"
            stroke="currentColor"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

/**
 * Mock signing for run-as-platform deployments. Passkey enrollment happens in Settings;
 * this flow is assertion / session steps only.
 */
export function PlatformSigningFlow({
  clusterName,
  onComplete,
  onCancel,
}: PlatformSigningFlowProps) {
  const [phase, setPhase] = useState<PlatformSigningPhase>(() => {
    if (!shouldRequireSettingsPasskeyEnrollment()) return "authorize";
    return isPasskeyEnrollmentComplete() ? "authorize" : "settings-required";
  });
  const [setupRecheckFailed, setSetupRecheckFailed] = useState(false);

  const tryContinueAfterSettings = () => {
    if (isPasskeyEnrollmentComplete()) {
      setSetupRecheckFailed(false);
      setPhase("authorize");
    } else {
      setSetupRecheckFailed(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-signing-title"
    >
      {phase === "settings-required" && (
        <div
          className="w-full max-w-md rounded-lg border p-8 shadow-xl"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <CardTitle id="platform-signing-title" className="text-center mb-3">
            Finish signing setup first
          </CardTitle>
          <SmallText muted className="text-center block mb-6">
            Run-as-platform deployments use a passkey you register in Settings (along with your
            external signing key). Complete passkey setup there, then continue here.
          </SmallText>
          {setupRecheckFailed && (
            <p
              className="mb-4 rounded-md border px-3 py-2 text-center text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--muted)",
                fontFamily: "var(--font-family-text)",
              }}
            >
              Signing setup wasn&apos;t detected yet. Finish the passkey step in Settings, then try
              again.
            </p>
          )}
          <Link
            to="/settings"
            className="mb-3 block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-family-text)" }}
          >
            Open Settings
          </Link>
          <PrimaryButton className="w-full" onClick={tryContinueAfterSettings}>
            I&apos;ve finished setup in Settings
          </PrimaryButton>
          <div className="mt-6 flex justify-center">
            <SecondaryButton onClick={onCancel}>Cancel deployment</SecondaryButton>
          </div>
        </div>
      )}

      {phase === "authorize" && (
        <div
          className="w-full max-w-md rounded-lg border p-8 shadow-xl"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <CardTitle className="mb-2">Sign cluster deployment</CardTitle>
          <SmallText muted className="mb-6 block">
            Confirm your identity to authorize this run-as-platform deployment for{" "}
            <strong style={{ color: "var(--foreground)" }}>{clusterName}</strong>.
          </SmallText>
          <div
            className="flex items-center gap-3 p-3 rounded-md mb-6"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="rounded-full size-10 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--secondary)" }}
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--foreground)" }}>
                <path
                  d="M12 11c1.66 0 3-1.34 3-3S13.66 5 12 5 9 6.34 9 8s1.34 3 3 3z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>
              <TinyText muted>Signing as</TinyText>
              <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                adi.cluster.admin@example.com
              </SmallText>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            {SIGNING_PERMISSIONS.map((p) => (
              <li key={p.label} className="flex items-start gap-3">
                <PermIcon kind={p.icon} />
                <SmallText>{p.label}</SmallText>
              </li>
            ))}
          </ul>
          <PrimaryButton className="w-full" onClick={() => setPhase("qr-authorize")}>
            Sign with passkey
          </PrimaryButton>
          <TinyText muted className="text-center block mt-3">
            You will be prompted for biometric verification or your security key.
          </TinyText>
          <div className="mt-6 flex justify-center">
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          </div>
        </div>
      )}

      {phase === "qr-authorize" && (
        <div
          className="w-full max-w-md rounded-lg border p-8 shadow-xl"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <CardTitle className="text-center mb-2">Sign in to authorize</CardTitle>
          <SmallText muted className="text-center block mb-6">
            Scan this code with your phone to sign in and approve this session for{" "}
            <strong style={{ color: "var(--foreground)" }}>{clusterName}</strong>. This step
            completes login so the platform can run this deployment as you—it is separate from the
            one-time passkey registration you did in Settings.
          </SmallText>
          <MockQrBlock />
          <TinyText muted className="text-center block mt-4">
            Use the same identity provider you use for the console (for example OpenID Connect or
            CIBA on your device).
          </TinyText>
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <SecondaryButton onClick={() => setPhase("authorize")}>Back</SecondaryButton>
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => setPhase("success")}>
              Simulate login complete
            </PrimaryButton>
          </div>
        </div>
      )}

      {phase === "success" && (
        <div
          className="w-full max-w-md rounded-lg border p-8 shadow-xl text-center"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="mx-auto mb-4 size-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#3E8635" }}
          >
            <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <CardTitle className="mb-2">Deployment signed</CardTitle>
          <SmallText muted className="mb-1 block">
            The management engine can proceed with provisioning{" "}
            <strong style={{ color: "var(--foreground)" }}>{clusterName}</strong> using platform
            execution.
          </SmallText>
          <TinyText muted className="mb-6 block">
            Signed {new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </TinyText>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SIGNING_PERMISSIONS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: "rgba(62, 134, 53, 0.12)",
                  color: "#1e4d1a",
                  fontFamily: "var(--font-family-text)",
                }}
              >
                <svg className="size-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {p.label}
              </span>
            ))}
          </div>
          <PrimaryButton className="w-full" onClick={onComplete}>
            Continue
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
