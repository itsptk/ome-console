import { useState } from "react";
import {
  CardTitle,
  SmallText,
  TinyText,
  PrimaryButton,
  SecondaryButton,
} from "../../../imports/UIComponents";

export type PlatformSigningPhase =
  | "passkey-setup"
  | "browser-prompt"
  | "authorize"
  | "qr-authorize"
  | "success";

interface PlatformSigningFlowProps {
  clusterName: string;
  onComplete: () => void;
  onCancel: () => void;
}

/** Decorative QR placeholder (mock only). */
function MockQrBlock() {
  const cells = Array.from({ length: 169 }, (_, i) => i);
  return (
    <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
      <div
        className="grid gap-0 w-full h-full p-2"
        style={{
          gridTemplateColumns: "repeat(13, 1fr)",
          backgroundColor: "#fff",
          border: "1px solid var(--border)",
        }}
      >
        {cells.map((i) => (
          <div
            key={i}
            className="aspect-square"
            style={{
              backgroundColor: (i * 17 + (i % 7)) % 4 === 0 ? "#111" : "#f0f0f0",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            backgroundColor: "#fff",
            border: "2px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: "var(--foreground)" }}
          >
            <path
              d="M12 11c1.66 0 3-1.34 3-3S13.66 5 12 5 9 6.34 9 8s1.34 3 3 3z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M4 20c0-3.31 3.13-6 8-6s8 2.69 8 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
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
 * Mocked WebAuthn / passkey signing flow (run as platform), aligned with the
 * passkey enrollment, signing consent, QR login, then success.
 */
export function PlatformSigningFlow({
  clusterName,
  onComplete,
  onCancel,
}: PlatformSigningFlowProps) {
  const [phase, setPhase] = useState<PlatformSigningPhase>("passkey-setup");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-signing-title"
    >
      {phase === "passkey-setup" && (
        <div
          className="w-full max-w-md rounded-lg border p-8 shadow-xl"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="flex justify-center mb-6">
            <div
              className="rounded-full flex items-center justify-center size-16"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <svg
                className="size-8"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path
                  d="M15 7a4 4 0 10-8 0 4 4 0 008 0zM5 21v-1a6 6 0 0112 0v1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <CardTitle id="platform-signing-title" className="text-center mb-3">
            Set up a passkey to sign
          </CardTitle>
          <SmallText muted className="text-center block mb-8">
            A passkey lets you prove your identity using your device&apos;s built-in security (for
            example fingerprint, face, or screen lock). The private key never leaves your device.
          </SmallText>
          <PrimaryButton className="w-full" onClick={() => setPhase("browser-prompt")}>
            Set up passkey
          </PrimaryButton>
          <TinyText muted className="text-center block mt-4">
            Your browser will walk you through a one-time setup.
          </TinyText>
          <div className="mt-6 flex justify-center">
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          </div>
        </div>
      )}

      {phase === "browser-prompt" && (
        <div className="w-full max-w-lg">
          <div
            className="rounded-t-lg px-4 py-2 flex items-center gap-2"
            style={{
              backgroundColor: "var(--secondary)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full" style={{ backgroundColor: "#EE5F5B" }} />
              <span className="size-3 rounded-full" style={{ backgroundColor: "#F0C14C" }} />
              <span className="size-3 rounded-full" style={{ backgroundColor: "#5CB85C" }} />
            </div>
            <TinyText className="truncate flex-1 text-center opacity-80">
              Passkeys &amp; Security Keys — mock browser UI
            </TinyText>
          </div>
          <div
            className="rounded-b-lg border border-t-0 p-6 shadow-xl"
            style={{
              backgroundColor: "#fafafa",
              borderColor: "var(--border)",
            }}
          >
            <h3
              className="text-center mb-4"
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Passkeys &amp; Security Keys
            </h3>
            <SmallText className="block mb-3 text-center">
              Use your phone or tablet: scan this QR code with the device where you want to create
              your passkey.
            </SmallText>
            <MockQrBlock />
            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <SmallText className="flex items-center gap-2 justify-center">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" style={{ color: "var(--muted-foreground)" }}>
                  <rect x="4" y="7" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 17v2h6v-2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Or insert and touch your security key.
              </SmallText>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <SecondaryButton onClick={() => setPhase("passkey-setup")}>Back</SecondaryButton>
              <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
              <PrimaryButton onClick={() => setPhase("authorize")}>
                Simulate passkey created
              </PrimaryButton>
            </div>
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
            <SecondaryButton onClick={() => setPhase("browser-prompt")}>Back</SecondaryButton>
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
            <strong style={{ color: "var(--foreground)" }}>{clusterName}</strong>. This is
            separate from creating your passkey—it completes login so the platform can run this
            deployment as you.
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
