import { useState } from "react";
import { SmallText, TinyText } from "../../../imports/UIComponents";
import type { SmartphoneAuthContext } from "../security/r2SecurityUxCopy";

type VerificationMethod = "passkey" | "otp" | "password";

interface SmartphoneAuthProps {
  onAuthorize: () => void;
  context?: SmartphoneAuthContext;
}

const DEFAULT_CONTEXT: SmartphoneAuthContext = {
  headline: "Approve OpenShift cluster update",
  actionLabel: "OpenShift cluster update",
};

export function SmartphoneAuth({
  onAuthorize,
  context = DEFAULT_CONTEXT,
}: SmartphoneAuthProps) {
  const [method, setMethod] = useState<VerificationMethod>("passkey");

  const methodLabel = {
    passkey: "Passkey / Face ID",
    otp: "One-time code",
    password: "Password + MFA",
  }[method];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="flex flex-col items-center">
        <div
          className="relative overflow-hidden rounded-[3rem] border-8"
          style={{
            width: "320px",
            height: "640px",
            borderColor: "#1a1a1a",
            backgroundColor: "#000",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="flex h-full flex-col"
            style={{ backgroundColor: "var(--background)" }}
          >
            <div
              className="flex items-center justify-between px-6 py-3"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                9:41
              </TinyText>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
              <div
                className="mb-6 flex size-20 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--primary)",
                  borderRadius: "calc(var(--radius) * 2)",
                }}
              >
                <svg
                  className="size-12"
                  fill="none"
                  viewBox="0 0 48 48"
                  style={{ color: "var(--primary-foreground)" }}
                >
                  <path
                    d="M24 4L8 14V30L24 40L40 30V14L24 4Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="mb-3 text-center"
                style={{
                  fontFamily: "var(--font-family-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--foreground)",
                }}
              >
                {context.headline}
              </h2>

              <div className="mb-6 w-full text-center">
                <SmallText muted className="mb-2 block">
                  Your approval is required to continue:
                </SmallText>
                <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {context.actionLabel}
                </SmallText>
                {context.resourceName && (
                  <TinyText muted className="mt-2 block">
                    Resource: {context.resourceName}
                  </TinyText>
                )}
                <TinyText muted className="mt-3 block">
                  The current step completed. Approve now to start the next
                  phase.
                </TinyText>
              </div>

              <div className="mb-4 w-full">
                <TinyText muted className="mb-2 block text-center">
                  Verification method (policy-driven)
                </TinyText>
                <div className="flex flex-wrap justify-center gap-1">
                  {(
                    [
                      ["passkey", "Passkey"],
                      ["otp", "OTP"],
                      ["password", "Password"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className="rounded px-2 py-1 text-xs"
                      style={{
                        backgroundColor:
                          method === id ? "var(--primary)" : "var(--secondary)",
                        color:
                          method === id
                            ? "var(--primary-foreground)"
                            : "var(--foreground)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onAuthorize}
                className="w-full rounded py-3 transition-colors"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--font-weight-semibold)",
                  borderRadius: "var(--radius)",
                }}
              >
                Approve with {methodLabel}
              </button>

              <button
                type="button"
                className="mt-4"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  color: "var(--primary)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <SmallText style={{ color: "white" }}>
            Tap approve to continue — prototype demo
          </SmallText>
        </div>
      </div>
    </div>
  );
}
