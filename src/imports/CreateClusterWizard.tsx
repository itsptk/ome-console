import { useState } from "react";
import {
  CardTitle,
  SmallText,
  TinyText,
  LabelText,
  PrimaryButton,
  SecondaryButton,
  ModalOverlay,
  ModalContent,
} from "./UIComponents";

/** Stored `runAs` value when the user selects Platform in Identity & Approval. */
export const RUN_AS_PLATFORM_VALUE = "Platform Service";

/** Stored `runAs` value for the logged-in user (“You”) in Identity & Approval. */
export const RUN_AS_YOU_VALUE = "Personal (Adi Cluster Admin)";

/** Session key shared with Settings default execution identity. */
export const DEFAULT_RUN_AS_STORAGE_KEY = "ome-prototype-default-run-as";

function readInitialRunAsFromSettings(): string {
  const allowed = new Set<string>([
    RUN_AS_YOU_VALUE,
    RUN_AS_PLATFORM_VALUE,
    "Service account: ome-system-manager-sa",
    "Service account: bulk-upgrade-worker-v4",
  ]);
  if (typeof sessionStorage === "undefined") {
    return RUN_AS_PLATFORM_VALUE;
  }
  try {
    const v = sessionStorage.getItem(DEFAULT_RUN_AS_STORAGE_KEY);
    if (v && allowed.has(v)) return v;
  } catch {
    /* ignore */
  }
  return RUN_AS_PLATFORM_VALUE;
}

interface CreateClusterWizardProps {
  onComplete: (formData: any) => void;
  onCancel: () => void;
}

type Step =
  | "cluster-details"
  | "networking"
  | "host-discovery"
  | "settings"
  | "execution-policy"
  | "review";

export function CreateClusterWizard({
  onComplete,
  onCancel,
}: CreateClusterWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(
    "cluster-details",
  );
  const [formData, setFormData] = useState({
    clusterName: "my-virtualmachine-cluster",
    baseDomain: "example.com",
    cpuArchitecture: "x86_64",
    saveAsTemplate: false,
    runAs: readInitialRunAsFromSettings(),
    requireManualConfirmation: false,
  });

  const steps: { id: Step; label: string; number: number }[] = [
    {
      id: "cluster-details",
      label: "Cluster details",
      number: 1,
    },
    { id: "networking", label: "Networking", number: 2 },
    {
      id: "host-discovery",
      label: "Host discovery",
      number: 3,
    },
    { id: "settings", label: "Settings", number: 4 },
    {
      id: "execution-policy",
      label: "Identity & Approval",
      number: 5,
    },
    { id: "review", label: "Review", number: 6 },
  ];

  const currentStepIndex = steps.findIndex(
    (s) => s.id === currentStep,
  );

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      // Wizard complete
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <ModalOverlay onClose={onCancel}>
      <ModalContent maxWidth="5xl">
        <div
          className="flex"
          style={{ minHeight: "600px", maxHeight: "85vh" }}
        >
          {/* Left Sidebar - Steps Navigation */}
          <div
            className="w-64 flex-shrink-0 p-6"
            style={{
              backgroundColor: "var(--secondary)",
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Wizard Title */}
            <div className="mb-6">
              <CardTitle>Create cluster</CardTitle>
              <TinyText muted className="mt-2">
                Configure a new OpenShift cluster
              </TinyText>
            </div>

            {/* Steps List */}
            <nav className="space-y-1">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.id)}
                  className="w-full text-left px-3 py-3 rounded transition-colors flex items-start gap-3"
                  style={{
                    borderRadius: "var(--radius)",
                    backgroundColor:
                      currentStep === step.id
                        ? "var(--primary)"
                        : "transparent",
                    color:
                      currentStep === step.id
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                  }}
                >
                  {/* Step Number */}
                  <div
                    className="flex items-center justify-center size-6 rounded-full border-2 flex-shrink-0"
                    style={{
                      borderColor:
                        currentStep === step.id
                          ? "var(--primary-foreground)"
                          : step.number < currentStepIndex + 1
                            ? "var(--primary)"
                            : "var(--border)",
                      backgroundColor:
                        step.number < currentStepIndex + 1 &&
                        currentStep !== step.id
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        step.number < currentStepIndex + 1 &&
                        currentStep !== step.id
                          ? "var(--primary-foreground)"
                          : currentStep === step.id
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
                    }}
                  >
                    {step.number < currentStepIndex + 1 ? (
                      <svg
                        className="size-3.5"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M13 4L6 11L3 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <TinyText
                        style={{
                          fontWeight:
                            "var(--font-weight-medium)",
                          fontSize: "11px",
                          color: "inherit",
                        }}
                      >
                        {step.number}
                      </TinyText>
                    )}
                  </div>

                  {/* Step Label */}
                  <TinyText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                      lineHeight: "1.5",
                      color: "inherit",
                    }}
                  >
                    {step.label}
                  </TinyText>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div
              className="px-8 py-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary)",
                }}
                className="mb-1"
              >
                Step {currentStepIndex + 1} of {steps.length}
              </SmallText>
              <h2
                style={{
                  fontFamily: "var(--font-family-display)",
                  fontSize: "var(--text-xl)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {steps[currentStepIndex].label}
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              {currentStep === "cluster-details" && (
                <ClusterDetailsStep
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === "networking" && (
                <NetworkingStep />
              )}
              {currentStep === "host-discovery" && (
                <HostDiscoveryStep />
              )}
              {currentStep === "settings" && <SettingsStep />}
              {currentStep === "execution-policy" && (
                <ExecutionPolicyStep
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === "review" && (
                <ReviewStep
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <SecondaryButton
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </SecondaryButton>
              <div className="flex gap-3">
                <SecondaryButton onClick={onCancel}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={handleNext}>
                  {currentStepIndex === steps.length - 1
                    ? "Create cluster"
                    : "Next"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

// Step Components

function ClusterDetailsStep({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div
        className="flex gap-3 p-4 border-l-4"
        style={{
          backgroundColor: "#E7F1FA",
          borderLeftColor: "#0066CC",
          borderRadius: "var(--radius)",
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 20 20"
          style={{ color: "#0066CC" }}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 6V10M10 14H10.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <SmallText
          style={{
            color: "#151515",
          }}
        >
          Based on your selection, we have pre-configured this
          cluster for high-availability virtualization.
        </SmallText>
      </div>

      <div>
        <label
          htmlFor="cluster-name"
          className="block mb-2"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Cluster name{" "}
          <span style={{ color: "var(--destructive)" }}>*</span>
        </label>
        <input
          id="cluster-name"
          type="text"
          value={formData.clusterName}
          onChange={(e) =>
            setFormData({
              ...formData,
              clusterName: e.target.value,
            })
          }
          className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="base-domain"
          className="block mb-2"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Base domain{" "}
          <span style={{ color: "var(--destructive)" }}>*</span>
        </label>
        <input
          id="base-domain"
          type="text"
          value={formData.baseDomain}
          onChange={(e) =>
            setFormData({
              ...formData,
              baseDomain: e.target.value,
            })
          }
          className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
          }}
        />
      </div>

      <div>
        <label
          className="block mb-3"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          CPU architecture{" "}
          <span style={{ color: "var(--destructive)" }}>*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cpu-architecture"
              value="x86_64"
              checked={formData.cpuArchitecture === "x86_64"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cpuArchitecture: e.target.value,
                })
              }
              className="w-4 h-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <span
              className="flex items-center gap-2"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              x86_64
              <span
                className="px-2 py-0.5 border"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-xs)",
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                Recommended
              </span>
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cpu-architecture"
              value="aarch64"
              checked={formData.cpuArchitecture === "aarch64"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cpuArchitecture: e.target.value,
                })
              }
              className="w-4 h-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              aarch64 (ARM64)
            </span>
          </label>
        </div>
      </div>

      <div>
        <label
          className="block mb-3"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Features
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 opacity-75 cursor-not-allowed">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-4 h-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              OpenShift Virtualization
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function NetworkingStep() {
  return (
    <div className="space-y-6">
      {/* Placeholder fields */}
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
    </div>
  );
}

function HostDiscoveryStep() {
  return (
    <div className="space-y-6">
      {/* Placeholder fields */}
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-20 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
    </div>
  );
}

function SettingsStep() {
  return (
    <div className="space-y-6">
      {/* Placeholder fields */}
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-24 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
      <div
        className="h-10 border"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
        }}
      />
    </div>
  );
}

function ExecutionPolicyStep({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [showRunAsHelp, setShowRunAsHelp] = useState(false);
  const [showConfirmationHelp, setShowConfirmationHelp] =
    useState(false);

  return (
    <div className="space-y-6">
      {/* Run As Dropdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <LabelText>Run as</LabelText>
          <button
            type="button"
            className="relative"
            onMouseEnter={() => setShowRunAsHelp(true)}
            onMouseLeave={() => setShowRunAsHelp(false)}
            aria-label="Help for Run as"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 16 16"
              style={{ color: "var(--muted-foreground)" }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 11.5V11.5M8 8.5C8 8.5 8.75 8.5 8.75 7.75C8.75 7 8 6.5 7.25 6.5C6.5 6.5 6 7 6 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {showRunAsHelp && (
              <div
                className="absolute left-0 top-full mt-2 p-4 border z-50"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th
                        className="text-left p-2 border-b"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Run as
                      </th>
                      <th
                        className="text-left p-2 border-b"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Audit log shows
                      </th>
                      <th
                        className="text-left p-2 border-b"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Target cluster sees
                      </th>
                      <th
                        className="text-left p-2 border-b"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Credential duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        You
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        You
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        You
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        ~10 minutes
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Service account
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Service account
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Service account
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Until revoked
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Platform
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        You
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Platform
                      </td>
                      <td
                        className="p-2"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          fontSize: "var(--text-xs)",
                          color: "var(--foreground)",
                        }}
                      >
                        Until revoked
                      </td>
                    </tr>
                  </tbody>
                </table>
                <SmallText
                  className="mt-3 block max-w-md"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Platform uses client-side signing (WebAuthn). It is only
                  available on certain provisioning paths—not every environment
                  (for example, not ROSA).
                </SmallText>
              </div>
            )}
          </button>
        </div>
        <select
          value={formData.runAs}
          onChange={(e) =>
            setFormData({ ...formData, runAs: e.target.value })
          }
          className="w-full px-3 py-2.5 border rounded"
          style={{
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <option value={RUN_AS_YOU_VALUE}>
            You: Adi Cluster Admin
          </option>
          <option value="Service account: ome-system-manager-sa">
            Service account: ome-system-manager-sa
          </option>
          <option value="Service account: bulk-upgrade-worker-v4">
            Service account: bulk-upgrade-worker-v4
          </option>
          <option value={RUN_AS_PLATFORM_VALUE}>Platform</option>
        </select>
        {formData.runAs === RUN_AS_YOU_VALUE && (
          <div
            className="flex gap-3 p-4 border-l-4 mt-4"
            style={{
              backgroundColor: "#E7F1FA",
              borderLeftColor: "#0066CC",
              borderRadius: "var(--radius)",
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 20 20"
              style={{ color: "#0066CC" }}
              aria-hidden
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10 6V10M10 14H10.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <SmallText style={{ color: "#151515" }}>
              Your interactive session is short-lived (about 10 minutes).
              Long-running work may pause and ask you to sign in again—for
              example with a phone notification (CIBA)—before it can continue.
            </SmallText>
          </div>
        )}
        <TinyText muted className="mt-2 block">
          Options shown are for understanding the security model; a shipped
          product may offer fewer choices depending on environment.
        </TinyText>
      </div>

      {/* Require Manual Confirmation Checkbox */}
      <div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="requireManualConfirmation"
            checked={formData.requireManualConfirmation}
            onChange={(e) =>
              setFormData({
                ...formData,
                requireManualConfirmation: e.target.checked,
              })
            }
            className="mt-1"
            style={{
              accentColor: "var(--primary)",
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor="requireManualConfirmation"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                Require manifest approval before applying
              </label>
              <button
                type="button"
                className="relative"
                onMouseEnter={() =>
                  setShowConfirmationHelp(true)
                }
                onMouseLeave={() =>
                  setShowConfirmationHelp(false)
                }
                aria-label="Help for Require Manual Confirmation"
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 11.5V11.5M8 8.5C8 8.5 8.75 8.5 8.75 7.75C8.75 7 8 6.5 7.25 6.5C6.5 6.5 6 7 6 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {showConfirmationHelp && (
                  <div
                    className="absolute left-0 top-full mt-2 w-80 p-4 border z-50"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <SmallText>
                      The cluster creation will pause for a
                      final review before applying the
                      configuration.
                    </SmallText>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h3
        className="mb-4"
        style={{
          fontFamily: "var(--font-family-display)",
          fontSize: "var(--text-lg)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        Review your configuration
      </h3>
      <div className="space-y-4">
        <div
          className="flex justify-between py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Cluster name
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {formData.clusterName}
          </span>
        </div>
        <div
          className="flex justify-between py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Base domain
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {formData.baseDomain}
          </span>
        </div>
        <div
          className="flex justify-between py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            CPU architecture
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {formData.cpuArchitecture}
          </span>
        </div>
        <div
          className="flex justify-between py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Run as
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {formData.runAs}
          </span>
        </div>
        <div
          className="flex justify-between py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Require manifest review before applying
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {formData.requireManualConfirmation ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div
        className="flex items-center pt-4 mt-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <input
          type="checkbox"
          checked={formData.saveAsTemplate}
          onChange={(e) =>
            setFormData({
              ...formData,
              saveAsTemplate: e.target.checked,
            })
          }
          className="w-4 h-4"
          style={{ accentColor: "var(--primary)" }}
        />
        <label
          className="ml-2"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          Save as cluster template
        </label>
      </div>
    </div>
  );
}