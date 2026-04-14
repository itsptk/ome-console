import { useState } from "react";
import {
  CardTitle,
  SmallText,
  TinyText,
  PrimaryButton,
  SecondaryButton,
} from "../../../imports/UIComponents";

type PasskeyEnrollmentPhase = "passkey-setup" | "browser-prompt";

/** Decorative QR placeholder (mock only). */
export function MockQrBlock() {
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

export interface PasskeyEnrollmentMockProps {
  /** Called after the user completes the mock “passkey created” step. */
  onEnrollmentComplete: () => void;
  onCancel?: () => void;
  /** When false, omit cancel (e.g. embedded wizard where back is handled elsewhere). */
  showCancel?: boolean;
  /** Optional id for the first screen title (a11y). */
  titleId?: string;
}

/**
 * Mock WebAuthn passkey enrollment: intro + fake browser / QR create flow.
 * Use in Settings during external signing setup; deployment uses assertion-only steps.
 */
export function PasskeyEnrollmentMock({
  onEnrollmentComplete,
  onCancel,
  showCancel = true,
  titleId,
}: PasskeyEnrollmentMockProps) {
  const [phase, setPhase] = useState<PasskeyEnrollmentPhase>("passkey-setup");

  return (
    <>
      {phase === "passkey-setup" && (
        <div>
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
                <path
                  d="M12 11v4M10 13h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <CardTitle
            id={titleId}
            className="text-center mb-3"
          >
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
          {showCancel && onCancel && (
            <div className="mt-6 flex justify-center">
              <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
            </div>
          )}
        </div>
      )}

      {phase === "browser-prompt" && (
        <div className="w-full max-w-lg mx-auto">
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
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <rect x="4" y="7" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 17v2h6v-2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Or insert and touch your security key.
              </SmallText>
            </div>
            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <SecondaryButton onClick={() => setPhase("passkey-setup")}>Back</SecondaryButton>
              {showCancel && onCancel && (
                <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
              )}
              <PrimaryButton onClick={onEnrollmentComplete}>Simulate passkey created</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
