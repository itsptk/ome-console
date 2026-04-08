import { useState } from "react";
import {
  ModalOverlay,
  CardTitle,
  BodyText,
  SmallText,
  TinyText,
  LabelText,
  PrimaryButton,
  SecondaryButton,
  TextInput,
  LinkButton,
  SearchInput,
} from "../../../imports/UIComponents";
import { Alert } from "@patternfly/react-core";
// Use base-no-reset to get PF styling without global CSS resets affecting other elements
import "@patternfly/react-core/dist/styles/base-no-reset.css";

interface DeploymentWizardProps {
  onComplete: (formData?: any) => void;
  onCancel: () => void;
}

type ActionType = "update" | "install" | "apply" | "delete" | "create";

type ActionOption = {
  id: string;
  type: ActionType;
  category: string;
  name: string;
  description: string;
  requiresVersion?: boolean;
  compatibleWith?: string[]; // IDs of actions this is compatible with
};

type SelectedAction = {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  sourceVersion?: string;
  targetVersion?: string;
};

// Action-based configurations with verbs (Update, Install, Apply, Delete, Create)
const availableActions: ActionOption[] = [
  // Platform Updates
  {
    id: "update-ocp-4.17",
    type: "update",
    category: "Update",
    name: "Update OpenShift 4.16 → 4.17",
    description:
      "Platform update with security patches and new features",
    requiresVersion: false,
    compatibleWith: [
      "install-cert-manager",
      "apply-network-policy",
    ],
  },
  {
    id: "update-ocp-4.18",
    type: "update",
    category: "Update",
    name: "Update OpenShift 4.17 → 4.18",
    description:
      "Latest stable release with performance improvements",
    requiresVersion: false,
  },
  {
    id: "update-etcd-3.5.12",
    type: "update",
    category: "Update",
    name: "Update etcd 3.5.9 → 3.5.12",
    description: "Critical stability and security fixes",
    requiresVersion: false,
  },
  // Install actions
  {
    id: "install-cert-manager",
    type: "install",
    category: "Install",
    name: "Install cert-manager v1.14",
    description: "Automated X.509 certificate management",
    requiresVersion: false,
    compatibleWith: ["update-ocp-4.17"],
  },
  {
    id: "install-logging-operator",
    type: "install",
    category: "Install",
    name: "Install Cluster Logging Operator v5.8",
    description: "Deploy centralized log aggregation",
    requiresVersion: false,
  },
  {
    id: "install-service-mesh",
    type: "install",
    category: "Install",
    name: "Install Service Mesh Operator v2.5",
    description: "Istio-based traffic management and observability",
    requiresVersion: false,
  },
  // Apply configurations
  {
    id: "apply-network-policy",
    type: "apply",
    category: "Apply",
    name: "Apply NetworkPolicy: deny-external",
    description: "Block external ingress to non-public namespaces",
    requiresVersion: false,
    compatibleWith: ["update-ocp-4.17"],
  },
  {
    id: "apply-pod-security",
    type: "apply",
    category: "Apply",
    name: "Apply PodSecurityPolicy: restricted",
    description: "Enforce restricted security context constraints",
    requiresVersion: false,
  },
  {
    id: "apply-resource-quota",
    type: "apply",
    category: "Apply",
    name: "Apply ResourceQuota: prod-limits",
    description: "Set CPU/memory limits for production namespaces",
    requiresVersion: false,
  },
  // Delete/Remove actions
  {
    id: "delete-deprecated-api",
    type: "delete",
    category: "Delete",
    name: "Delete deprecated v1beta1 APIs",
    description: "Remove deprecated API versions before upgrade",
    requiresVersion: false,
  },
  {
    id: "delete-orphaned-pvcs",
    type: "delete",
    category: "Delete",
    name: "Delete orphaned PersistentVolumeClaims",
    description: "Clean up unbound storage claims",
    requiresVersion: false,
  },
  // Create actions
  {
    id: "create-monitoring-stack",
    type: "create",
    category: "Create",
    name: "Create monitoring stack config",
    description: "Deploy Prometheus, Grafana, and AlertManager",
    requiresVersion: false,
  },
  {
    id: "create-backup-schedule",
    type: "create",
    category: "Create",
    name: "Create etcd backup schedule",
    description: "Configure daily automated etcd snapshots",
    requiresVersion: false,
  },
];

export function DeploymentWizard({
  onComplete,
  onCancel,
}: DeploymentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedActions: [] as SelectedAction[],
    fleetSelection: "label",
    labelSelector: "env=prod",
    rolloutMethod: "canary", // "immediate" | "canary" | "rolling"
    scheduleType: "window",
    scheduleWindow: "weekends",
    scheduleStartTime: "22:00",
    scheduleEndTime: "02:00",
    phase1Count: "10",
    phase1Batch: "2",
    phase1MaxParallel: "5",
    phase1Priority: "label:canary",
    phase1Soak: "24h",
    phase1RespectSchedule: true,
    phase1SafetyBrake: "50",
    phase2Batch: "3",
    phase2MaxParallel: "10",
    phase2StopOnFailure: true,
    phase2FailureThreshold: "1",
    phase2Start: "Tue 18:00",
    phase2Soak: "24h",
    schedule: "Global Maint Window",
    runAs: "Personal (Adi Cluster Admin)",
    requireManualConfirmation: false,
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const steps = [
    {
      number: 1,
      label: "Action", // Action verb: Update, Delete, Create, etc.
      name: "action",
    },
    {
      number: 2,
      label: "Placement", // WHERE it goes (which clusters)
      name: "placement",
    },
    {
      number: 3,
      label: "Rollout", // HOW it's sequenced (Immediate, Canary, Rolling)
      name: "rollout",
    },
    {
      number: 4,
      label: "Execution policy",
      name: "execution-policy",
    },
    { number: 5, label: "Review & submit", name: "review" },
  ];

  return (
    <ModalOverlay onClose={onCancel}>
      {/* Custom modal container to avoid ModalContent styling conflicts with PatternFly */}
      <div
        className="w-full max-w-5xl flex rounded-lg overflow-hidden"
        style={{
          minHeight: "600px",
          maxHeight: "85vh",
          borderRadius: "var(--radius)",
          boxShadow: "var(--elevation-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
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
              <CardTitle>Create deployment</CardTitle>
              <TinyText muted className="mt-2">
                Configure your fleet-wide deployment strategy
              </TinyText>
            </div>

            {/* Steps List */}
            <nav className="space-y-1">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className="w-full text-left px-3 py-3 rounded transition-colors flex items-start gap-3"
                  style={{
                    borderRadius: "var(--radius)",
                    backgroundColor:
                      currentStep === step.number
                        ? "var(--primary)"
                        : "transparent",
                    color:
                      currentStep === step.number
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                  }}
                >
                  {/* Step Number */}
                  <div
                    className="flex items-center justify-center size-6 rounded-full border-2 flex-shrink-0"
                    style={{
                      borderColor:
                        currentStep === step.number
                          ? "var(--primary-foreground)"
                          : step.number < currentStep
                            ? "var(--primary)"
                            : "var(--border)",
                      backgroundColor:
                        step.number < currentStep &&
                        currentStep !== step.number
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        step.number < currentStep &&
                        currentStep !== step.number
                          ? "var(--primary-foreground)"
                          : currentStep === step.number
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
                    }}
                  >
                    {step.number < currentStep ? (
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
                  <SmallText
                    style={{
                      fontWeight:
                        currentStep === step.number
                          ? "var(--font-weight-medium)"
                          : "var(--font-weight-normal)",
                      color: "inherit",
                      lineHeight: "1.5",
                    }}
                  >
                    {step.label}
                  </SmallText>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div
            className="flex-1 flex flex-col"
            style={{ minHeight: 0, backgroundColor: "var(--card)" }}
          >
            {/* Header with Close Button */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--foreground)",
                  }}
                >
                  {steps[currentStep - 1].label}
                </h4>
                <TinyText muted className="mt-1">
                  {currentStep === 1 &&
                    "Choose an action: Update, Install, Apply, Delete, or Create"}
                  {currentStep === 2 &&
                    "Select clusters to include in this deployment"}
                  {currentStep === 3 &&
                    "Choose how the deployment is sequenced"}
                  {currentStep === 4 &&
                    "Choose execution permissions and confirmation settings"}
                  {currentStep === 5 &&
                    "Review your deployment configuration before submitting"}
                </TinyText>
              </div>

              {/* Close Button */}
              <button
                onClick={onCancel}
                className="p-1.5 rounded transition-colors hover:bg-muted"
                style={{ borderRadius: "var(--radius)" }}
                aria-label="Close wizard"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 16 16"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Step Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto px-6 py-6"
              style={{ backgroundColor: "var(--background)" }}
            >
              {currentStep === 1 && (
                <Step1Content
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === 2 && (
                <Step2Content
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === 3 && (
                <Step3Content
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === 4 && (
                <Step4Content
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {currentStep === 5 && (
                <Step5Content formData={formData} />
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <SecondaryButton onClick={onCancel}>
                Cancel
              </SecondaryButton>
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <SecondaryButton onClick={handleBack}>
                    Back
                  </SecondaryButton>
                )}
                {currentStep < totalSteps ? (
                  <PrimaryButton onClick={handleNext}>
                    Next
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={handleSubmit}>
                    Create deployment
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </div>
    </ModalOverlay>
  );
}

function Step1Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDependentSearch, setShowDependentSearch] =
    useState(false);
  const [dependentSearchQuery, setDependentSearchQuery] =
    useState("");
  const [isDependentDropdownOpen, setIsDependentDropdownOpen] =
    useState(false);

  const selectedActions: SelectedAction[] =
    formData.selectedActions || [];

  // Filter available actions based on search
  const filteredActions = availableActions.filter((action) => {
    const query = searchQuery.toLowerCase();
    return (
      action.name.toLowerCase().includes(query) ||
      action.category.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query)
    );
  });

  // Filter dependent actions - only show compatible ones
  const filteredDependentActions = availableActions.filter(
    (action) => {
      const query = dependentSearchQuery.toLowerCase();
      const matchesQuery =
        action.name.toLowerCase().includes(query) ||
        action.category.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query);

      // If we have a primary action selected, filter by compatibility
      if (selectedActions.length > 0 && selectedActions[0].id) {
        const primaryAction = availableActions.find(
          (c) => c.id === selectedActions[0].id,
        );
        if (primaryAction?.compatibleWith) {
          return (
            matchesQuery &&
            primaryAction.compatibleWith.includes(action.id)
          );
        }
      }

      return matchesQuery;
    },
  );

  // Group actions by category
  const groupedActions = filteredActions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category].push(action);
      return acc;
    },
    {} as Record<string, ActionOption[]>,
  );

  const groupedDependentActions =
    filteredDependentActions.reduce(
      (acc, action) => {
        if (!acc[action.category]) {
          acc[action.category] = [];
        }
        acc[action.category].push(action);
        return acc;
      },
      {} as Record<string, ActionOption[]>,
    );

  const handleSelectAction = (action: ActionOption) => {
    const newAction: SelectedAction = {
      id: action.id,
      type: action.type,
      name: action.name,
      description: action.description,
      // Default versions for cluster update
      sourceVersion: action.requiresVersion
        ? "4.15.12"
        : undefined,
      targetVersion: action.requiresVersion
        ? "4.16.2"
        : undefined,
    };

    setFormData({
      ...formData,
      selectedActions: [newAction, ...selectedActions.slice(1)],
    });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleSelectDependentAction = (
    action: ActionOption,
  ) => {
    const newAction: SelectedAction = {
      id: action.id,
      type: action.type,
      name: action.name,
      description: action.description,
    };

    setFormData({
      ...formData,
      selectedActions: [...selectedActions, newAction],
    });
    setIsDependentDropdownOpen(false);
    setDependentSearchQuery("");
    setShowDependentSearch(false);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = selectedActions.filter(
      (_, i) => i !== index,
    );
    setFormData({
      ...formData,
      selectedActions: newActions,
    });
    if (index === 1) {
      setShowDependentSearch(false);
    }
  };

  const updateActionVersion = (
    index: number,
    field: "sourceVersion" | "targetVersion",
    value: string,
  ) => {
    const newActions = [...selectedActions];
    newActions[index] = {
      ...newActions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      selectedActions: newActions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Action Selector */}
      <div>
        <LabelText className="mb-2">
          Search available actions
        </LabelText>
        <div className="relative">
          <div
            className="relative"
            onFocus={() => setIsDropdownOpen(true)}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search actions (Update, Install, Apply, Delete, Create)"
              className="w-full px-4 py-2.5 border rounded pr-10"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path
                  d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.33333"
                />
                <path
                  d="M14 14L10.5 10.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.33333"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown content */}
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-card border z-20 max-h-96 overflow-y-auto"
                style={{
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                {Object.keys(groupedActions).length > 0 ? (
                  Object.entries(groupedActions).map(
                    ([category, actions]) => (
                      <div key={category}>
                        <div
                          className="px-4 py-2"
                          style={{
                            backgroundColor: "var(--secondary)",
                            borderBottom:
                              "1px solid var(--border)",
                          }}
                        >
                          <TinyText
                            style={{
                              fontWeight:
                                "var(--font-weight-medium)",
                              color: "var(--muted-foreground)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {category}
                          </TinyText>
                        </div>
                        {actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() =>
                              handleSelectAction(action)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                            style={{
                              borderBottom:
                                "1px solid var(--border)",
                            }}
                          >
                            <SmallText
                              style={{
                                fontWeight:
                                  "var(--font-weight-medium)",
                              }}
                            >
                              {action.name}
                            </SmallText>
                            <TinyText muted className="mt-1">
                              {action.description}
                            </TinyText>
                          </button>
                        ))}
                      </div>
                    ),
                  )
                ) : (
                  <div className="px-4 py-8 text-center">
                    <TinyText muted>
                      No actions found matching "{searchQuery}"
                    </TinyText>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Actions */}
      {selectedActions.length > 0 && (
        <div className="space-y-0">
          {selectedActions.map((action, index) => (
            <div key={`${action.id}-${index}`}>
              {/* Action Card */}
              <div
                className="p-4 border rounded relative"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--primary)",
                  backgroundColor: "var(--secondary)",
                }}
              >
                {/* Order Badge */}
                {selectedActions.length > 1 && (
                  <div
                    className="absolute -left-3 top-4 size-8 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--primary)",
                      borderColor: "var(--background)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    <TinyText
                      style={{
                        fontWeight: "var(--font-weight-bold)",
                        fontSize: "12px",
                        color: "inherit",
                      }}
                    >
                      {index + 1}
                    </TinyText>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <SmallText
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {action.name}
                    </SmallText>
                    <TinyText muted className="mt-1">
                      {action.description}
                    </TinyText>
                  </div>
                  <button
                    onClick={() => handleRemoveAction(index)}
                    className="ml-4 p-1 hover:bg-destructive/10 rounded transition-colors"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 16 16"
                      style={{ color: "var(--destructive)" }}
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                </div>

                {/* Version Fields for Updates */}
                {action.sourceVersion !== undefined &&
                  action.targetVersion !== undefined && (
                    <div
                      className="grid grid-cols-2 gap-3 pt-3"
                      style={{
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <TinyText muted className="mb-1.5">
                          Source version
                        </TinyText>
                        <select
                          value={action.sourceVersion}
                          onChange={(e) =>
                            updateActionVersion(
                              index,
                              "sourceVersion",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            fontFamily:
                              "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            backgroundColor: "var(--card)",
                          }}
                        >
                          <option value="4.14.8">4.14.8</option>
                          <option value="4.15.12">
                            4.15.12
                          </option>
                        </select>
                      </div>
                      <div>
                        <TinyText muted className="mb-1.5">
                          Target version
                        </TinyText>
                        <select
                          value={action.targetVersion}
                          onChange={(e) =>
                            updateActionVersion(
                              index,
                              "targetVersion",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            fontFamily:
                              "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            backgroundColor: "var(--card)",
                          }}
                        >
                          <option value="4.16.2">4.16.2</option>
                          <option value="4.16.5">4.16.5</option>
                          <option value="4.17.0">4.17.0</option>
                        </select>
                      </div>
                    </div>
                  )}
              </div>

              {/* Arrow Connector between actions */}
              {index < selectedActions.length - 1 && (
                <div className="flex items-center py-3 pl-3">
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <path
                      d="M12 5V19M12 19L8 15M12 19L16 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <SmallText muted className="ml-2">
                    Executes after step {index + 1} completes
                  </SmallText>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Dependent Action */}
      {selectedActions.length > 0 &&
        selectedActions.length < 3 &&
        !showDependentSearch && (
          <div>
            <LinkButton
              className="flex items-center gap-2"
              onClick={() => setShowDependentSearch(true)}
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M3.33333 8H12.6667"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.33333"
                />
                <path
                  d="M8 3.33333V12.6667"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.33333"
                />
              </svg>
              <span>Add dependent action</span>
            </LinkButton>
          </div>
        )}

      {/* Dependent Action Search */}
      {showDependentSearch && selectedActions.length < 3 && (
        <div>
          <LabelText className="mb-2">
            Add compatible dependent action
          </LabelText>
          <div className="relative">
            <div
              className="relative"
              onFocus={() => setIsDependentDropdownOpen(true)}
            >
              <input
                type="text"
                value={dependentSearchQuery}
                onChange={(e) => {
                  setDependentSearchQuery(e.target.value);
                  setIsDependentDropdownOpen(true);
                }}
                placeholder="Search compatible actions..."
                className="w-full px-4 py-2.5 border rounded pr-10"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  backgroundColor: "var(--background)",
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <path
                    d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                  <path
                    d="M14 14L10.5 10.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                </svg>
              </div>
            </div>

            {/* Dropdown */}
            {isDependentDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() =>
                    setIsDependentDropdownOpen(false)
                  }
                />

                {/* Dropdown content */}
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-card border z-20 max-h-96 overflow-y-auto"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  {Object.keys(groupedDependentActions).length >
                  0 ? (
                    <>
                      <div
                        className="px-4 py-2"
                        style={{
                          backgroundColor: "var(--secondary)",
                          borderBottom:
                            "1px solid var(--border)",
                        }}
                      >
                        <TinyText muted>
                          Showing actions compatible with{" "}
                          {selectedActions[0].name}
                        </TinyText>
                      </div>
                      {Object.entries(
                        groupedDependentActions,
                      ).map(([category, actions]) => (
                        <div key={category}>
                          <div
                            className="px-4 py-2"
                            style={{
                              backgroundColor: "var(--muted)",
                              borderBottom:
                                "1px solid var(--border)",
                            }}
                          >
                            <TinyText
                              style={{
                                fontWeight:
                                  "var(--font-weight-medium)",
                                color:
                                  "var(--muted-foreground)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {category}
                            </TinyText>
                          </div>
                          {actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() =>
                                handleSelectDependentAction(
                                  action,
                                )
                              }
                              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                              style={{
                                borderBottom:
                                  "1px solid var(--border)",
                              }}
                            >
                              <SmallText
                                style={{
                                  fontWeight:
                                    "var(--font-weight-medium)",
                                }}
                              >
                                {action.name}
                              </SmallText>
                              <TinyText muted className="mt-1">
                                {action.description}
                              </TinyText>
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <TinyText muted>
                        {filteredDependentActions.length ===
                          0 && dependentSearchQuery
                          ? `No compatible actions found matching "${dependentSearchQuery}"`
                          : "No compatible actions available"}
                      </TinyText>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock cluster data
const allClusters = [
  // Production clusters (8 total)
  { name: "virt-prod-01", env: "prod", region: "us-east-1", labels: ["env=prod", "tier=web"] },
  { name: "virt-prod-02", env: "prod", region: "us-west-2", labels: ["env=prod", "tier=web"] },
  { name: "virt-prod-03", env: "prod", region: "eu-west-1", labels: ["env=prod", "tier=web"] },
  { name: "virt-prod-04", env: "prod", region: "ap-south-1", labels: ["env=prod", "tier=web"] },
  { name: "virt-prod-05", env: "prod", region: "ap-southeast-1", labels: ["env=prod", "tier=web"] },
  { name: "data-prod-01", env: "prod", region: "us-east-1", labels: ["env=prod", "tier=data"] },
  { name: "data-prod-02", env: "prod", region: "us-west-2", labels: ["env=prod", "tier=data"] },
  { name: "data-prod-03", env: "prod", region: "eu-west-1", labels: ["env=prod", "tier=data"] },
  // Canary clusters (4 total) - these get updates first
  { name: "canary-us-east-01", env: "canary", region: "us-east-1", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-us-west-01", env: "canary", region: "us-west-2", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-eu-west-01", env: "canary", region: "eu-west-1", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-ap-south-01", env: "canary", region: "ap-south-1", labels: ["env=canary", "tier=canary", "tier=web"] },
  // Staging clusters
  { name: "virt-staging-01", env: "staging", region: "us-east-1", labels: ["env=staging", "tier=web"] },
  { name: "virt-staging-02", env: "staging", region: "us-west-2", labels: ["env=staging", "tier=web"] },
  { name: "data-staging-01", env: "staging", region: "us-east-1", labels: ["env=staging", "tier=data"] },
  // Dev clusters
  { name: "virt-dev-01", env: "dev", region: "us-east-1", labels: ["env=dev", "tier=web"] },
  { name: "virt-dev-02", env: "dev", region: "us-east-1", labels: ["env=dev", "tier=web"] },
];

// Helper function to match clusters by label selector
const matchClustersBySelector = (selector: string) => {
  if (!selector?.trim()) return [];
  const selectorParts = selector.split(",").map((s) => s.trim().toLowerCase());
  return allClusters.filter((cluster) =>
    selectorParts.some((part) =>
      cluster.labels.some((label) => label.toLowerCase().includes(part))
    )
  );
};

function Step2Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [clusterSearch, setClusterSearch] = useState("");

  // Get selected clusters from formData or default to empty array
  const selectedClusterNames: string[] = formData.selectedClusters || [];

  // Filter clusters based on label selector
  const getMatchedClusters = () => {
    if (formData.fleetSelection === "label") {
      const selector = formData.labelSelector?.trim() || "";
      if (!selector) return [];
      // Simple label matching simulation
      return allClusters.filter((c) =>
        c.labels.some((label) =>
          label.toLowerCase().includes(selector.toLowerCase())
        )
      );
    } else {
      // Manual selection - return selected clusters
      return allClusters.filter((c) => selectedClusterNames.includes(c.name));
    }
  };

  const matchedClusters = getMatchedClusters();

  // Filter available clusters for the searchable list
  const filteredClusters = clusterSearch
    ? allClusters.filter((c) =>
        c.name.toLowerCase().includes(clusterSearch.toLowerCase())
      )
    : allClusters;

  const toggleClusterSelection = (clusterName: string) => {
    const current = formData.selectedClusters || [];
    const updated = current.includes(clusterName)
      ? current.filter((n: string) => n !== clusterName)
      : [...current, clusterName];
    setFormData({ ...formData, selectedClusters: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Cluster Placement */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <SmallText
            style={{ fontWeight: "var(--font-weight-medium)" }}
          >
            Cluster selection
          </SmallText>
          <div className="relative group">
            <svg
              className="size-4 cursor-help"
              fill="none"
              viewBox="0 0 16 16"
              style={{ color: "var(--muted-foreground)" }}
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
                borderRadius: "var(--radius)",
              }}
            >
              Define which clusters this deployment applies to
            </div>
          </div>
        </div>

        {/* Radio Group */}
        <div className="space-y-2 mb-4">
          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.fleetSelection === "label"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.fleetSelection === "label"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="fleetSelection"
              value="label"
              checked={formData.fleetSelection === "label"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fleetSelection: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Select with label selector
            </SmallText>
          </label>

          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.fleetSelection === "searchable"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.fleetSelection === "searchable"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="fleetSelection"
              value="searchable"
              checked={formData.fleetSelection === "searchable"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fleetSelection: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Select from cluster list
            </SmallText>
          </label>
        </div>

        {/* Dynamic: Label Selector */}
        {formData.fleetSelection === "label" && (
          <div
            className="pl-4"
            style={{ borderLeft: "2px solid var(--border)" }}
          >
            <TinyText muted className="mb-2">
              Label selector
            </TinyText>
            <TextInput
              value={formData.labelSelector}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  labelSelector: e.target.value,
                })
              }
              placeholder="e.g., env=prod"
            />
            <TinyText muted className="mt-2">
              Try: env=prod, env=staging, tier=web, tier=data
            </TinyText>
          </div>
        )}

        {/* Dynamic: Searchable List */}
        {formData.fleetSelection === "searchable" && (
          <div
            className="pl-4"
            style={{ borderLeft: "2px solid var(--border)" }}
          >
            <SearchInput
              placeholder="Search clusters..."
              className="mb-3"
              value={clusterSearch}
              onChange={(e) => setClusterSearch(e.target.value)}
            />
            <div
              className="border rounded overflow-hidden"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="bg-secondary px-4 py-2 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Available clusters ({filteredClusters.length})
                </TinyText>
                {selectedClusterNames.length > 0 && (
                  <TinyText style={{ color: "var(--primary)" }}>
                    {selectedClusterNames.length} selected
                  </TinyText>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredClusters.map((cluster) => (
                  <label
                    key={cluster.name}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: selectedClusterNames.includes(cluster.name)
                        ? "var(--secondary)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                      checked={selectedClusterNames.includes(cluster.name)}
                      onChange={() => toggleClusterSelection(cluster.name)}
                    />
                    <div className="flex-1">
                      <SmallText>{cluster.name}</SmallText>
                      <TinyText muted className="ml-2">
                        {cluster.env} · {cluster.region}
                      </TinyText>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matched Clusters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
            Matched clusters
          </SmallText>
          <TinyText muted>{matchedClusters.length} clusters</TinyText>
        </div>

        {matchedClusters.length === 0 ? (
          <div
            className="p-6 border rounded text-center"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <TinyText muted>
              {formData.fleetSelection === "label"
                ? "Enter a label selector to see matching clusters"
                : "Select clusters from the list above"}
            </TinyText>
          </div>
        ) : (
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)" }}>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Cluster name
                    </TinyText>
                  </th>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Environment
                    </TinyText>
                  </th>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Region
                    </TinyText>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchedClusters.map((cluster, idx) => (
                  <tr
                    key={cluster.name}
                    style={{
                      borderBottom:
                        idx < matchedClusters.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-2">
                      <SmallText>{cluster.name}</SmallText>
                    </td>
                    <td className="px-4 py-2">
                      <TinyText muted>{cluster.env}</TinyText>
                    </td>
                    <td className="px-4 py-2">
                      <TinyText muted>{cluster.region}</TinyText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Step3Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [phase1Expanded, setPhase1Expanded] = useState(true);
  const [phase2Expanded, setPhase2Expanded] = useState(true);
  const [pacingConfigExpanded, setPacingConfigExpanded] = useState(true);

  return (
    <div className="space-y-6">
      {/* Rollout Selection */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-3"
        >
          Rollout
        </SmallText>

        <div className="grid grid-cols-3 gap-3">
          {/* Canary - Lowest risk (default) */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "canary" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "canary"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "canary"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "canary" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Canary
            </SmallText>
            <TinyText muted className="mt-1">
              Subset first, then rest
            </TinyText>
          </button>

          {/* Rolling - Medium risk */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "rolling" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "rolling"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "rolling"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "rolling" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Rolling
            </SmallText>
            <TinyText muted className="mt-1">
              Waves of X clusters
            </TinyText>
          </button>

          {/* Immediate - Highest risk */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "immediate" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "immediate"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "immediate"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "immediate" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Immediate
            </SmallText>
            <TinyText muted className="mt-1">
              All at once
            </TinyText>
          </button>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-3"
        >
          Schedule
        </SmallText>

        <div className="space-y-2 mb-4">
          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.scheduleType === "immediate"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.scheduleType === "immediate"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="scheduleType"
              value="immediate"
              checked={formData.scheduleType === "immediate"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduleType: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <div>
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Start immediately
              </SmallText>
              <TinyText muted className="mt-0.5">
                Begin deployment as soon as it's submitted
              </TinyText>
            </div>
          </label>

          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.scheduleType === "window"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.scheduleType === "window"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="scheduleType"
              value="window"
              checked={formData.scheduleType === "window"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduleType: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <div>
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Scheduled window
              </SmallText>
              <TinyText muted className="mt-0.5">
                Only deploy during defined maintenance windows
              </TinyText>
            </div>
          </label>
        </div>

        {/* Dynamic: Window Settings */}
        {formData.scheduleType === "window" && (
          <div
            className="pl-4 space-y-3"
            style={{ borderLeft: "2px solid var(--border)" }}
          >
            <div>
              <TinyText muted className="mb-2">
                Window
              </TinyText>
              <select
                value={formData.scheduleWindow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduleWindow: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--card)",
                }}
              >
                <option value="weekends">Weekends</option>
                <option value="weekdays">Weekdays</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <TinyText muted className="mb-2">
                  Start time
                </TinyText>
                <input
                  type="time"
                  value={formData.scheduleStartTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleStartTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                />
              </div>
              <div>
                <TinyText muted className="mb-2">
                  End time
                </TinyText>
                <input
                  type="time"
                  value={formData.scheduleEndTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleEndTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canary Configuration - Only show if Canary is selected */}
      {formData.rolloutMethod === "canary" && (
        <div className="space-y-4">
          {/* Phase 1: Canary rollout */}
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setPhase1Expanded(!phase1Expanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
              style={{
                borderBottom: phase1Expanded
                  ? "1px solid var(--border)"
                  : "none",
              }}
            >
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Phase 1: Canary rollout
              </SmallText>
              <svg
                className="size-5 transition-transform"
                style={{
                  transform: phase1Expanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {phase1Expanded && (
              <div className="p-4 space-y-4">
                {/* Canary Selection */}
                <div>
                  <TinyText muted className="mb-2">
                    Canary label selector
                  </TinyText>
                  <TextInput
                    value={formData.canarySelector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canarySelector: e.target.value,
                      })
                    }
                    placeholder="e.g., tier=canary, env=staging"
                  />
                  <TinyText muted className="mt-1">
                    Label selector to identify canary clusters (deploys to these first)
                  </TinyText>
                </div>

                {/* Matched Clusters - similar to Placement step */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Matched clusters
                    </SmallText>
                    <TinyText muted>
                      {matchClustersBySelector(formData.canarySelector || "").length} clusters
                    </TinyText>
                  </div>

                  {matchClustersBySelector(formData.canarySelector || "").length === 0 ? (
                    <div
                      className="p-6 border rounded text-center"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        backgroundColor: "var(--secondary)",
                      }}
                    >
                      <TinyText muted>
                        Enter a label selector to see matching clusters (e.g., tier=canary)
                      </TinyText>
                    </div>
                  ) : (
                    <div
                      className="border rounded overflow-hidden"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: "var(--secondary)" }}>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Cluster name
                              </TinyText>
                            </th>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Environment
                              </TinyText>
                            </th>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Region
                              </TinyText>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchClustersBySelector(formData.canarySelector || "").map((cluster, idx, arr) => (
                            <tr
                              key={cluster.name}
                              style={{
                                borderBottom:
                                  idx < arr.length - 1
                                    ? "1px solid var(--border)"
                                    : "none",
                              }}
                            >
                              <td className="px-4 py-2">
                                <SmallText>{cluster.name}</SmallText>
                              </td>
                              <td className="px-4 py-2">
                                <TinyText muted>{cluster.env}</TinyText>
                              </td>
                              <td className="px-4 py-2">
                                <TinyText muted>{cluster.region}</TinyText>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Clusters per wave */}
                <div>
                  <TinyText muted className="mb-2">
                    Clusters per wave
                  </TinyText>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.phase1Batch || "2"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1Batch: e.target.value,
                        })
                      }
                      min="1"
                      className="w-24 px-3 py-2 border rounded"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-family-text)",
                        fontSize: "var(--text-sm)",
                        backgroundColor: "var(--card)",
                      }}
                    />
                    <TinyText>clusters</TinyText>
                  </div>
                  <TinyText muted className="mt-1">
                    Maximum number of canary clusters to update simultaneously
                  </TinyText>
                </div>

                {/* Soak Duration */}
                <div>
                  <TinyText muted className="mb-2">
                    Soak duration
                  </TinyText>
                  <select
                    value={formData.phase1Soak}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase1Soak: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">None (proceed immediately)</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="4h">4 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours (1 day)</option>
                    <option value="48h">48 hours (2 days)</option>
                    <option value="72h">72 hours (3 days)</option>
                    <option value="7d">7 days</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Observation time after canary deployment before proceeding to full rollout
                  </TinyText>
                </div>

                {/* Error Threshold */}
                <div>
                  <TinyText muted className="mb-2">
                    Error threshold
                  </TinyText>
                  <select
                    value={formData.phase1ErrorThreshold || "0"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase1ErrorThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">0% — Stop on any failure</option>
                    <option value="5">5% — Conservative (recommended)</option>
                    <option value="10">10% — Moderate tolerance</option>
                    <option value="25">25% — High tolerance</option>
                    <option value="100">100% — Never stop</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Halt canary phase if cumulative failure rate exceeds this threshold
                  </TinyText>
                </div>

                {/* Auto-promote */}
                <div>
                  <label
                    className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-secondary"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      backgroundColor:
                        formData.autoPromote
                          ? "var(--secondary)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.autoPromote !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoPromote: e.target.checked,
                        })
                      }
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div>
                      <SmallText>Auto-promote after soak</SmallText>
                      <TinyText muted className="mt-0.5">
                        Automatically proceed to full rollout if soak passes without errors
                      </TinyText>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 5. Phase 2: Full rollout */}
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setPhase2Expanded(!phase2Expanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
              style={{
                borderBottom: phase2Expanded
                  ? "1px solid var(--border)"
                  : "none",
              }}
            >
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Phase 2: Full rollout
              </SmallText>
              <svg
                className="size-5 transition-transform"
                style={{
                  transform: phase2Expanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {phase2Expanded && (
              <div className="p-4 space-y-4">
                {/* Clusters per wave */}
                <div>
                  <TinyText muted className="mb-2">
                    Clusters per wave
                  </TinyText>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.phase2Batch || "3"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase2Batch: e.target.value,
                        })
                      }
                      min="1"
                      className="w-24 px-3 py-2 border rounded"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-family-text)",
                        fontSize: "var(--text-sm)",
                        backgroundColor: "var(--card)",
                      }}
                    />
                    <TinyText>clusters</TinyText>
                  </div>
                  <TinyText muted className="mt-1">
                    Maximum number of clusters to update simultaneously in each wave
                  </TinyText>
                </div>

                {/* Soak between waves */}
                <div>
                  <TinyText muted className="mb-2">
                    Soak time between waves
                  </TinyText>
                  <select
                    value={formData.phase2SoakTime || "0"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase2SoakTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">None (continuous waves)</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Wait time after each wave completes before starting the next
                  </TinyText>
                </div>

                {/* Error Threshold */}
                <div>
                  <TinyText muted className="mb-2">
                    Error threshold
                  </TinyText>
                  <select
                    value={formData.phase2ErrorThreshold || "5"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase2ErrorThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">0% — Stop on any failure</option>
                    <option value="5">5% — Conservative (recommended)</option>
                    <option value="10">10% — Moderate tolerance</option>
                    <option value="25">25% — High tolerance</option>
                    <option value="100">100% — Never stop</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Halt rollout if cumulative failure rate exceeds this threshold
                  </TinyText>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rolling Configuration - Only show if Rolling is selected */}
      {formData.rolloutMethod === "rolling" && (
        <div
          className="border rounded overflow-hidden"
          style={{
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setPacingConfigExpanded(!pacingConfigExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
            style={{
              borderBottom: pacingConfigExpanded
                ? "1px solid var(--border)"
                : "none",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Rolling configuration
            </SmallText>
            <svg
              className="size-5 transition-transform"
              style={{
                transform: pacingConfigExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {pacingConfigExpanded && (
            <div className="p-4 space-y-4">
              {/* Clusters per wave */}
              <div>
                <TinyText muted className="mb-2">
                  Clusters per wave
                </TinyText>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.pacingBatchSize || "5"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pacingBatchSize: e.target.value,
                      })
                    }
                    min="1"
                    className="w-24 px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  />
                  <TinyText>clusters</TinyText>
                </div>
                <TinyText muted className="mt-1">
                  Maximum number of clusters to update simultaneously in each wave
                </TinyText>
              </div>

              {/* Soak time between waves */}
              <div>
                <TinyText muted className="mb-2">
                  Soak time between waves
                </TinyText>
                <select
                  value={formData.pacingSoakTime || "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pacingSoakTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="0">None (continuous waves)</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                </select>
                <TinyText muted className="mt-1">
                  Wait time after each wave completes before starting the next
                </TinyText>
              </div>

              {/* Stop on error threshold */}
              <div>
                <TinyText muted className="mb-2">
                  Error threshold
                </TinyText>
                <select
                  value={formData.pacingErrorThreshold || "5"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pacingErrorThreshold: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="0">0% — Stop on any failure</option>
                  <option value="5">5% — Conservative (recommended)</option>
                  <option value="10">10% — Moderate tolerance</option>
                  <option value="25">25% — High tolerance</option>
                  <option value="100">100% — Never stop</option>
                </select>
                <TinyText muted className="mt-1">
                  Halt deployment if cumulative failure rate exceeds this threshold
                </TinyText>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Immediate confirmation message */}
      {formData.rolloutMethod === "immediate" && (
        <Alert
          variant="warning"
          title="High-risk rollout"
          isInline
        >
          All matched clusters will be updated simultaneously. 
          Consider using Canary or Rolling for production deployments.
        </Alert>
      )}
    </div>
  );
}

function Step4Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [showRunAsHelp, setShowRunAsHelp] = useState(false);
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false);

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
                className="absolute left-0 top-full mt-2 w-96 p-4 border z-50"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    marginBottom: "8px",
                  }}
                >
                  Choose whether to execute this upgrade using your personal
                  permissions or a managed platform identity.
                </SmallText>
                <div className="space-y-3 mt-3">
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Personal:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Uses your current login. The task may pause if your
                      session expires or you disconnect.
                    </TinyText>
                  </div>
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Service Account:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Select a secure, persistent service account. The task
                      will continue even if you sign out.
                    </TinyText>
                  </div>
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Platform:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Uses a secure, persistent platform service account. The
                      task will continue even if you sign out.
                    </TinyText>
                  </div>
                </div>
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
          <option value="Personal (Adi Cluster Admin)">
            Personal (Adi Cluster Admin)
          </option>
          <option value="Service account: ome-system-manager-sa">
            Service account: ome-system-manager-sa
          </option>
          <option value="Service account: bulk-upgrade-worker-v4">
            Service account: bulk-upgrade-worker-v4
          </option>
          <option value="Platform Service">Platform Service</option>
        </select>
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
                Require Manual Confirmation
              </label>
              <button
                type="button"
                className="relative"
                onMouseEnter={() => setShowConfirmationHelp(true)}
                onMouseLeave={() => setShowConfirmationHelp(false)}
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
                      The upgrade will pause for a final review before applying
                      actions to the clusters.
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

function Step5Content({ formData }: { formData: any }) {
  const selectedActions: SelectedAction[] =
    formData.selectedActions || [];

  // Helper to format labels
  const formatLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Action Section */}
      <div
        className="p-6 border rounded"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-4"
        >
          Action
        </SmallText>

        <div className="space-y-3">
          {selectedActions.length > 0 ? (
            selectedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div>
                  <SmallText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {action.name}
                  </SmallText>
                  {action.sourceVersion &&
                    action.targetVersion && (
                      <TinyText muted className="mt-0.5">
                        {action.sourceVersion} →{" "}
                        {action.targetVersion}
                      </TinyText>
                    )}
                  {action.description && (
                    <TinyText muted className="mt-1">
                      {action.description}
                    </TinyText>
                  )}
                </div>
              </div>
            ))
          ) : (
            <TinyText muted>No actions selected</TinyText>
          )}
        </div>
      </div>

      {/* Placement Section */}
      {(() => {
        // Calculate matched clusters for review
        const selectedClusterNames: string[] = formData.selectedClusters || [];
        const reviewMatchedClusters =
          formData.fleetSelection === "label"
            ? allClusters.filter((c) => {
                const selector = formData.labelSelector?.trim() || "";
                if (!selector) return false;
                return c.labels.some((label) =>
                  label.toLowerCase().includes(selector.toLowerCase())
                );
              })
            : allClusters.filter((c) => selectedClusterNames.includes(c.name));
        const previewClusters = reviewMatchedClusters.slice(0, 3);
        const remainingCount = reviewMatchedClusters.length - 3;

        return (
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{ fontWeight: "var(--font-weight-medium)" }}
              className="mb-4"
            >
              Placement
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted>Selection method</TinyText>
                <SmallText className="text-right">
                  {formData.fleetSelection === "label"
                    ? `Label: ${formData.labelSelector}`
                    : "Manual selection"}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted>Matched clusters</TinyText>
                <SmallText
                  className="text-right"
                  style={{ fontWeight: "var(--font-weight-medium)" }}
                >
                  {reviewMatchedClusters.length} clusters
                </SmallText>
              </div>

              {/* Cluster list */}
              {reviewMatchedClusters.length > 0 && (
                <div className="pt-2">
                  <div
                    className="border rounded overflow-hidden"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <table className="w-full text-sm">
                      <tbody>
                        {previewClusters.map((cluster, idx) => (
                          <tr
                            key={cluster.name}
                            style={{
                              borderBottom:
                                idx < previewClusters.length - 1
                                  ? "1px solid var(--border)"
                                  : "none",
                            }}
                          >
                            <td className="px-3 py-1.5">
                              <TinyText>{cluster.name}</TinyText>
                            </td>
                            <td className="px-3 py-1.5">
                              <TinyText muted>{cluster.env}</TinyText>
                            </td>
                            <td className="px-3 py-1.5">
                              <TinyText muted>{cluster.region}</TinyText>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {remainingCount > 0 && (
                      <div
                        className="px-3 py-1.5 text-center"
                        style={{
                          backgroundColor: "var(--secondary)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <TinyText muted>+{remainingCount} more clusters</TinyText>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Rollout Section */}
      <div
        className="p-6 border rounded"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-4"
        >
          Rollout
        </SmallText>

        <div className="space-y-3">
          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted>Rollout</TinyText>
            <SmallText className="text-right capitalize">
              {formData.rolloutMethod}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted>Schedule</TinyText>
            <SmallText className="text-right">
              {formData.scheduleType === "window"
                ? ` ${formatLabel(formData.scheduleWindow)} ${formData.scheduleStartTime}-${formData.scheduleEndTime}`
                : formData.scheduleType === "immediate"
                  ? "Immediate"
                  : `Starts: ${formData.schedule}`}
            </SmallText>
          </div>

          {formData.rolloutMethod === "rolling" && (
            <>
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted>Clusters per wave</TinyText>
                <SmallText className="text-right">
                  {formData.pacingBatchSize || "5"} clusters
                </SmallText>
              </div>
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted>Soak time</TinyText>
                <SmallText className="text-right">
                  {formData.pacingSoakTime === "0" || !formData.pacingSoakTime
                    ? "None (continuous)"
                    : formData.pacingSoakTime}
                </SmallText>
              </div>
              <div
                className="flex items-start justify-between py-2"
              >
                <TinyText muted>Error threshold</TinyText>
                <SmallText className="text-right">
                  {formData.pacingErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.pacingErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.pacingErrorThreshold || "5"}%`}
                </SmallText>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Phase Configuration - Only show if Canary */}
      {formData.rolloutMethod === "canary" && (
        <>
          {/* Phase 1 Configuration */}
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
              className="mb-4"
            >
              Phase 1: Canary rollout
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Canary label selector</TinyText>
                <SmallText className="text-right font-mono text-xs">
                  {formData.canarySelector || "tier=canary"}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Canary clusters</TinyText>
                <SmallText
                  className="text-right"
                  style={{ fontWeight: "var(--font-weight-medium)" }}
                >
                  {matchClustersBySelector(formData.canarySelector || "tier=canary").length} cluster
                  {matchClustersBySelector(formData.canarySelector || "tier=canary").length !== 1 ? "s" : ""}
                </SmallText>
              </div>

              {/* Canary cluster list - similar to Placement view */}
              {(() => {
                const canaryClusters = matchClustersBySelector(formData.canarySelector || "tier=canary");
                const previewCanaryClusters = canaryClusters.slice(0, 3);
                const remainingCanaryCount = canaryClusters.length - 3;
                
                if (canaryClusters.length === 0) return null;
                
                return (
                  <div className="pt-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div
                      className="border rounded overflow-hidden"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <table className="w-full text-sm">
                        <tbody>
                          {previewCanaryClusters.map((cluster, idx) => (
                            <tr
                              key={cluster.name}
                              style={{
                                borderBottom:
                                  idx < previewCanaryClusters.length - 1
                                    ? "1px solid var(--border)"
                                    : "none",
                              }}
                            >
                              <td className="px-3 py-1.5">
                                <TinyText>{cluster.name}</TinyText>
                              </td>
                              <td className="px-3 py-1.5">
                                <TinyText muted>{cluster.env}</TinyText>
                              </td>
                              <td className="px-3 py-1.5">
                                <TinyText muted>{cluster.region}</TinyText>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {remainingCanaryCount > 0 && (
                        <div
                          className="px-3 py-1.5 text-center"
                          style={{
                            backgroundColor: "var(--secondary)",
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          <TinyText muted>+{remainingCanaryCount} more clusters</TinyText>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Clusters per wave</TinyText>
                <SmallText className="text-right">
                  {formData.phase1Batch || "2"} clusters
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Soak duration</TinyText>
                <SmallText className="text-right">
                  {formData.phase1Soak === "0" || !formData.phase1Soak
                    ? "None (immediate)"
                    : formData.phase1Soak}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Error threshold</TinyText>
                <SmallText className="text-right">
                  {formData.phase1ErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.phase1ErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.phase1ErrorThreshold || "0"}%`}
                </SmallText>
              </div>

              <div className="flex items-start justify-between py-2">
                <TinyText muted>Auto-promote</TinyText>
                <SmallText className="text-right">
                  {formData.autoPromote !== false
                    ? "Yes (automatic)"
                    : "No (manual approval)"}
                </SmallText>
              </div>
            </div>
          </div>

          {/* Phase 2 Configuration */}
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
              className="mb-4"
            >
              Phase 2: Full rollout
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Clusters per wave</TinyText>
                <SmallText className="text-right">
                  {formData.phase2Batch || "3"} clusters
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Soak time</TinyText>
                <SmallText className="text-right">
                  {formData.phase2SoakTime === "0" || !formData.phase2SoakTime
                    ? "None (continuous)"
                    : formData.phase2SoakTime}
                </SmallText>
              </div>

              <div className="flex items-start justify-between py-2">
                <TinyText muted>Error threshold</TinyText>
                <SmallText className="text-right">
                  {formData.phase2ErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.phase2ErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.phase2ErrorThreshold || "5"}%`}
                </SmallText>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Estimated Completion */}
      <div
        className="p-4 rounded flex items-start gap-3"
        style={{
          borderRadius: "var(--radius)",
          backgroundColor: "var(--secondary)",
        }}
      >
        <svg
          className="size-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 20 20"
          style={{ color: "var(--primary)" }}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 6V10L13 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <TinyText
            style={{ fontWeight: "var(--font-weight-medium)" }}
          >
            Estimated completion
          </TinyText>
          <TinyText muted className="mt-1">
            {formData.rolloutMethod === "canary"
              ? `This deployment will take approximately 5-7 days including soak times (${formData.phase1Soak || "24h"} after Phase 1, during the configured schedule).`
              : formData.rolloutMethod === "rolling"
                ? `This deployment will roll out ${formData.pacingBatchSize || "5"} clusters per wave${formData.pacingSoakTime && formData.pacingSoakTime !== "0" ? ` with ${formData.pacingSoakTime} soak between waves` : ""}.`
                : "This deployment will update all clusters immediately."}
          </TinyText>
        </div>
      </div>
    </div>
  );
}