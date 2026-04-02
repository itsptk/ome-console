import { useState } from "react";
import {
  ModalOverlay,
  ModalContent,
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

interface DeploymentWizardProps {
  onComplete: (formData?: any) => void;
  onCancel: () => void;
}

type ChangeType = "update" | "operator" | "policy" | "vm-image";

type ChangeOption = {
  id: string;
  type: ChangeType;
  category: string;
  name: string;
  description: string;
  requiresVersion?: boolean;
  compatibleWith?: string[]; // IDs of changes this is compatible with
};

type SelectedChange = {
  id: string;
  type: ChangeType;
  name: string;
  description: string;
  sourceVersion?: string;
  targetVersion?: string;
};

const availableChanges: ChangeOption[] = [
  // Updates
  {
    id: "update-4.15-4.16",
    type: "update",
    category: "Updates",
    name: "OpenShift Cluster Update",
    description:
      "OpenShift platform update including security patches",
    requiresVersion: true,
    compatibleWith: [
      "operator-cert-manager",
      "operator-logging",
    ],
  },
  {
    id: "update-etcd",
    type: "update",
    category: "Updates",
    name: "etcd Update",
    description: "Update etcd to latest stable version",
    requiresVersion: false,
  },
  // Operators
  {
    id: "operator-cert-manager",
    type: "operator",
    category: "Operators",
    name: "cert-manager Operator",
    description: "Automated certificate management",
    requiresVersion: false,
    compatibleWith: ["update-4.15-4.16"],
  },
  {
    id: "operator-logging",
    type: "operator",
    category: "Operators",
    name: "Cluster Logging Operator",
    description: "Centralized logging solution",
    requiresVersion: false,
    compatibleWith: ["update-4.15-4.16"],
  },
  {
    id: "operator-service-mesh",
    type: "operator",
    category: "Operators",
    name: "Service Mesh Operator",
    description: "Istio-based service mesh",
    requiresVersion: false,
  },
  // Policies
  {
    id: "policy-network",
    type: "policy",
    category: "Policies",
    name: "Network Policy",
    description: "Enforce pod network isolation rules",
    requiresVersion: false,
  },
  {
    id: "policy-pod-security",
    type: "policy",
    category: "Policies",
    name: "Pod Security Policy",
    description: "Define security context constraints",
    requiresVersion: false,
  },
  // VM Images
  {
    id: "vm-rhel9",
    type: "vm-image",
    category: "VM Images",
    name: "RHEL 9.2 Base Image",
    description:
      "Red Hat Enterprise Linux 9.2 virtual machine image",
    requiresVersion: false,
  },
  {
    id: "vm-windows",
    type: "vm-image",
    category: "VM Images",
    name: "Windows Server 2022",
    description: "Windows Server 2022 datacenter edition",
    requiresVersion: false,
  },
];

export function DeploymentWizard({
  onComplete,
  onCancel,
}: DeploymentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedChanges: [] as SelectedChange[],
    fleetSelection: "label",
    labelSelector: "env=prod",
    strategy: "canary",
    scheduleType: "window",
    scheduleWindow: "weekends",
    scheduleStartTime: "22:00",
    scheduleEndTime: "02:00",
    phase1Count: "10",
    phase1Batch: "3",
    phase1MaxParallel: "5",
    phase1Priority: "label:canary",
    phase1Soak: "24h",
    phase1RespectSchedule: true,
    phase1SafetyBrake: "50",
    phase2Batch: "10",
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
      label: "Change package",
      name: "change-package",
    },
    {
      number: 2,
      label: "Targeting & strategy",
      name: "targeting-strategy",
    },
    {
      number: 3,
      label: "Strategy configuration",
      name: "strategy-config",
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
            style={{ minHeight: 0 }}
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
                    "Select the changes to deploy across your fleet"}
                  {currentStep === 2 &&
                    "Define which clusters to target and deployment strategy"}
                  {currentStep === 3 &&
                    "Configure phase-specific deployment parameters"}
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
      </ModalContent>
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

  const selectedChanges: SelectedChange[] =
    formData.selectedChanges || [];

  // Filter available changes based on search
  const filteredChanges = availableChanges.filter((change) => {
    const query = searchQuery.toLowerCase();
    return (
      change.name.toLowerCase().includes(query) ||
      change.category.toLowerCase().includes(query) ||
      change.description.toLowerCase().includes(query)
    );
  });

  // Filter dependent changes - only show compatible ones
  const filteredDependentChanges = availableChanges.filter(
    (change) => {
      const query = dependentSearchQuery.toLowerCase();
      const matchesQuery =
        change.name.toLowerCase().includes(query) ||
        change.category.toLowerCase().includes(query) ||
        change.description.toLowerCase().includes(query);

      // If we have a primary change selected, filter by compatibility
      if (selectedChanges.length > 0 && selectedChanges[0].id) {
        const primaryChange = availableChanges.find(
          (c) => c.id === selectedChanges[0].id,
        );
        if (primaryChange?.compatibleWith) {
          return (
            matchesQuery &&
            primaryChange.compatibleWith.includes(change.id)
          );
        }
      }

      return matchesQuery;
    },
  );

  // Group changes by category
  const groupedChanges = filteredChanges.reduce(
    (acc, change) => {
      if (!acc[change.category]) {
        acc[change.category] = [];
      }
      acc[change.category].push(change);
      return acc;
    },
    {} as Record<string, ChangeOption[]>,
  );

  const groupedDependentChanges =
    filteredDependentChanges.reduce(
      (acc, change) => {
        if (!acc[change.category]) {
          acc[change.category] = [];
        }
        acc[change.category].push(change);
        return acc;
      },
      {} as Record<string, ChangeOption[]>,
    );

  const handleSelectChange = (change: ChangeOption) => {
    const newChange: SelectedChange = {
      id: change.id,
      type: change.type,
      name: change.name,
      description: change.description,
      // Default versions for cluster update
      sourceVersion: change.requiresVersion
        ? "4.15.12"
        : undefined,
      targetVersion: change.requiresVersion
        ? "4.16.2"
        : undefined,
    };

    setFormData({
      ...formData,
      selectedChanges: [newChange, ...selectedChanges.slice(1)],
    });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleSelectDependentChange = (
    change: ChangeOption,
  ) => {
    const newChange: SelectedChange = {
      id: change.id,
      type: change.type,
      name: change.name,
      description: change.description,
    };

    setFormData({
      ...formData,
      selectedChanges: [...selectedChanges, newChange],
    });
    setIsDependentDropdownOpen(false);
    setDependentSearchQuery("");
    setShowDependentSearch(false);
  };

  const handleRemoveChange = (index: number) => {
    const newChanges = selectedChanges.filter(
      (_, i) => i !== index,
    );
    setFormData({
      ...formData,
      selectedChanges: newChanges,
    });
    if (index === 1) {
      setShowDependentSearch(false);
    }
  };

  const updateChangeVersion = (
    index: number,
    field: "sourceVersion" | "targetVersion",
    value: string,
  ) => {
    const newChanges = [...selectedChanges];
    newChanges[index] = {
      ...newChanges[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      selectedChanges: newChanges,
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Change Selector */}
      <div>
        <LabelText className="mb-2">
          Search available changes
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
              placeholder="Search available changes (Updates, Operators, Policies, VM Images)"
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
                {Object.keys(groupedChanges).length > 0 ? (
                  Object.entries(groupedChanges).map(
                    ([category, changes]) => (
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
                        {changes.map((change) => (
                          <button
                            key={change.id}
                            onClick={() =>
                              handleSelectChange(change)
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
                              {change.name}
                            </SmallText>
                            <TinyText muted className="mt-1">
                              {change.description}
                            </TinyText>
                          </button>
                        ))}
                      </div>
                    ),
                  )
                ) : (
                  <div className="px-4 py-8 text-center">
                    <TinyText muted>
                      No changes found matching "{searchQuery}"
                    </TinyText>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Changes */}
      {selectedChanges.length > 0 && (
        <div className="space-y-0">
          {selectedChanges.map((change, index) => (
            <div key={`${change.id}-${index}`}>
              {/* Change Card */}
              <div
                className="p-4 border rounded relative"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--primary)",
                  backgroundColor: "var(--secondary)",
                }}
              >
                {/* Order Badge */}
                {selectedChanges.length > 1 && (
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
                      {change.name}
                    </SmallText>
                    <TinyText muted className="mt-1">
                      {change.description}
                    </TinyText>
                  </div>
                  <button
                    onClick={() => handleRemoveChange(index)}
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
                {change.sourceVersion !== undefined &&
                  change.targetVersion !== undefined && (
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
                          value={change.sourceVersion}
                          onChange={(e) =>
                            updateChangeVersion(
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
                          value={change.targetVersion}
                          onChange={(e) =>
                            updateChangeVersion(
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

              {/* Arrow Connector between changes */}
              {index < selectedChanges.length - 1 && (
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

      {/* Add Dependent Change */}
      {selectedChanges.length > 0 &&
        selectedChanges.length < 3 &&
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
              <span>Add dependent change</span>
            </LinkButton>
          </div>
        )}

      {/* Dependent Change Search */}
      {showDependentSearch && selectedChanges.length < 3 && (
        <div>
          <LabelText className="mb-2">
            Add compatible dependent change
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
                placeholder="Search compatible changes..."
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
                  {Object.keys(groupedDependentChanges).length >
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
                          Showing changes compatible with{" "}
                          {selectedChanges[0].name}
                        </TinyText>
                      </div>
                      {Object.entries(
                        groupedDependentChanges,
                      ).map(([category, changes]) => (
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
                          {changes.map((change) => (
                            <button
                              key={change.id}
                              onClick={() =>
                                handleSelectDependentChange(
                                  change,
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
                                {change.name}
                              </SmallText>
                              <TinyText muted className="mt-1">
                                {change.description}
                              </TinyText>
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <TinyText muted>
                        {filteredDependentChanges.length ===
                          0 && dependentSearchQuery
                          ? `No compatible changes found matching "${dependentSearchQuery}"`
                          : "No compatible changes available"}
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

function Step2Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [phase1Expanded, setPhase1Expanded] = useState(true);
  const [phase2Expanded, setPhase2Expanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Targeted clusters (Fleet Selection) */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-3"
        >
          Targeted clusters
        </SmallText>

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
              40 clusters match
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
            />
            <div
              className="border rounded overflow-hidden"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="bg-secondary px-4 py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Available clusters (40)
                </TinyText>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {[
                  "virt-prod-01",
                  "virt-prod-02",
                  "virt-prod-03",
                  "data-prod-01",
                  "data-prod-02",
                ].map((cluster) => (
                  <label
                    key={cluster}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <SmallText>{cluster}</SmallText>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Strategy Selection */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-3"
        >
          Strategy
        </SmallText>

        <div className="grid grid-cols-3 gap-3">
          {/* Rolling Update */}
          <button
            onClick={() =>
              setFormData({ ...formData, strategy: "rolling" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.strategy === "rolling"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.strategy === "rolling"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.strategy === "rolling" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Rolling Update
            </SmallText>
            <TinyText muted className="mt-1">
              Sequential deployment
            </TinyText>
          </button>

          {/* Canary */}
          <button
            onClick={() =>
              setFormData({ ...formData, strategy: "canary" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.strategy === "canary"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.strategy === "canary"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.strategy === "canary" ? "2px" : "1px",
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
              Test on subset first
            </TinyText>
          </button>

          {/* Blue/Green */}
          <button
            onClick={() =>
              setFormData({
                ...formData,
                strategy: "bluegreen",
              })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.strategy === "bluegreen"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.strategy === "bluegreen"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.strategy === "bluegreen"
                  ? "2px"
                  : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Blue/Green
            </SmallText>
            <TinyText muted className="mt-1">
              Parallel environment
            </TinyText>
          </button>
        </div>
      </div>

      {/* 3. Schedule (Global Constraint) */}
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
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Immediate
            </SmallText>
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
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Defined window
            </SmallText>
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
  const [phase2Expanded, setPhase2Expanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Phase Cards - Only show if Canary is selected */}
      {formData.strategy === "canary" && (
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
                {/* Phase 1 Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TinyText muted className="mb-2">
                      Canary count
                    </TinyText>
                    <input
                      type="number"
                      value={formData.phase1Count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1Count: e.target.value,
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
                      Batch size
                    </TinyText>
                    <input
                      type="number"
                      value={formData.phase1Batch}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1Batch: e.target.value,
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TinyText muted className="mb-2">
                      Max concurrency
                    </TinyText>
                    <input
                      type="number"
                      value={formData.phase1MaxParallel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1MaxParallel: e.target.value,
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
                    <TinyText muted className="mt-1">
                      Max clusters updating in parallel
                    </TinyText>
                  </div>
                  <div>
                    <TinyText muted className="mb-2">
                      Priority by label selector
                    </TinyText>
                    <TextInput
                      value={formData.phase1Priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1Priority: e.target.value,
                        })
                      }
                      placeholder="e.g., label:canary"
                    />
                  </div>
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
                    <option value="0h">None</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="48h">48 hours</option>
                    <option value="72h">72 hours</option>
                  </select>
                </div>

                {/* Respect Schedule Checkbox */}
                {formData.phase1Soak !== "0h" && (
                  <label
                    className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-secondary"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      backgroundColor:
                        formData.phase1RespectSchedule
                          ? "var(--secondary)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.phase1RespectSchedule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1RespectSchedule:
                            e.target.checked,
                        })
                      }
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <SmallText>Respect schedule</SmallText>
                  </label>
                )}

                {/* Safety Brake */}
                <div>
                  <TinyText muted className="mb-2">
                    Stop on error threshold
                  </TinyText>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.phase1SafetyBrake}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase1SafetyBrake: e.target.value,
                        })
                      }
                      min="0"
                      max="100"
                      className="w-24 px-3 py-2 border rounded"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-family-text)",
                        fontSize: "var(--text-sm)",
                        backgroundColor: "var(--card)",
                      }}
                    />
                    <TinyText>%</TinyText>
                  </div>
                  <TinyText muted className="mt-1">
                    If {formData.phase1SafetyBrake}% of canary clusters fail, the deployment stops
                  </TinyText>
                </div>
              </div>
            )}
          </div>

          {/* 5. Phase 2: General rollout */}
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
                Phase 2: General rollout
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
                {/* Phase 2 Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TinyText muted className="mb-2">
                      Batch size
                    </TinyText>
                    <input
                      type="number"
                      value={formData.phase2Batch}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase2Batch: e.target.value,
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
                      Max concurrency
                    </TinyText>
                    <input
                      type="number"
                      value={formData.phase2MaxParallel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase2MaxParallel: e.target.value,
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
                    <TinyText muted className="mt-1">
                      Max clusters updating in parallel
                    </TinyText>
                  </div>
                </div>

                {/* Stop on Failure Toggle */}
                <div>
                  <div className="flex items-center justify-between">
                    <SmallText
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      Stop on error threshold
                    </SmallText>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          phase2StopOnFailure:
                            !formData.phase2StopOnFailure,
                        })
                      }
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          formData.phase2StopOnFailure
                            ? "var(--primary)"
                            : "var(--border)",
                      }}
                      aria-label="Toggle stop on failure"
                    >
                      <span
                        className="inline-block size-4 transform rounded-full bg-white transition-transform"
                        style={{
                          transform:
                            formData.phase2StopOnFailure
                              ? "translateX(1.5rem)"
                              : "translateX(0.25rem)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Conditional Failure Threshold with Connector */}
                  {formData.phase2StopOnFailure && (
                    <div className="mt-4 ml-0 relative">
                      {/* Vertical connector line */}
                      <div
                        className="absolute left-0 top-0 w-0.5 h-full"
                        style={{
                          backgroundColor: "var(--border)",
                        }}
                      />

                      {/* Threshold input */}
                      <div className="ml-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <TinyText muted className="mb-1.5">
                              Error threshold
                            </TinyText>
                            <select
                              value={
                                formData.phase2FailureThreshold
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phase2FailureThreshold:
                                    e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded"
                              style={{
                                borderRadius: "var(--radius)",
                                borderColor: "var(--border)",
                                fontFamily:
                                  "var(--font-family-text)",
                                fontSize: "var(--text-sm)",
                                backgroundColor:
                                  "var(--background)",
                              }}
                            >
                              <option value="1">
                                1 cluster
                              </option>
                              <option value="2">
                                2 clusters
                              </option>
                              <option value="3">
                                3 clusters
                              </option>
                              <option value="5">
                                5 clusters
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Threshold - Only show if Stop on Failure is ON */}
                {formData.phase2StopOnFailure && (
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"></div>
                      <TinyText muted>
                        If{" "}
                        {formData.phase2FailureThreshold || "1"}{" "}
                        cluster
                        {formData.phase2FailureThreshold !== "1"
                          ? "s"
                          : ""}{" "}
                        in the general rollout fail
                        {formData.phase2FailureThreshold === "1"
                          ? "s"
                          : ""}
                        , the entire deployment stops
                      </TinyText>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message when not using Canary strategy */}
      {formData.strategy !== "canary" && (
        <div
          className="p-6 rounded text-center"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <SmallText muted>
            Phase configuration is only available for Canary
            deployment strategy.
          </SmallText>
          <TinyText muted className="mt-2">
            Go back to the previous step to select Canary
            strategy, or proceed to review your deployment.
          </TinyText>
        </div>
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
                      changes to the clusters.
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
  const selectedChanges: SelectedChange[] =
    formData.selectedChanges || [];

  // Helper to format labels
  const formatLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Change Package Section */}
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
          Change package
        </SmallText>

        <div className="space-y-3">
          {selectedChanges.length > 0 ? (
            selectedChanges.map((change, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div>
                  <SmallText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {change.name}
                  </SmallText>
                  {change.sourceVersion &&
                    change.targetVersion && (
                      <TinyText muted className="mt-0.5">
                        {change.sourceVersion} →{" "}
                        {change.targetVersion}
                      </TinyText>
                    )}
                  {change.description && (
                    <TinyText muted className="mt-1">
                      {change.description}
                    </TinyText>
                  )}
                </div>
              </div>
            ))
          ) : (
            <TinyText muted>No changes selected</TinyText>
          )}
        </div>
      </div>

      {/* Targeting & Strategy Section */}
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
          Targeting & strategy
        </SmallText>

        <div className="space-y-3">
          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted>Fleet selection</TinyText>
            <SmallText className="text-right">
              {formData.fleetSelection === "label"
                ? `Label selector: ${formData.labelSelector}`
                : "Selected clusters"}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted>Strategy</TinyText>
            <SmallText className="text-right capitalize">
              {formData.strategy}
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
        </div>
      </div>

      {/* Phase Configuration - Only show if Canary */}
      {formData.strategy === "canary" && (
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
                <TinyText muted>Canary count</TinyText>
                <SmallText className="text-right">
                  {formData.phase1Count} clusters
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Batch size</TinyText>
                <SmallText className="text-right">
                  {formData.phase1Batch} clusters at a time
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Max concurrency</TinyText>
                <SmallText className="text-right">
                  {formData.phase1MaxParallel} clusters in parallel
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Priority</TinyText>
                <SmallText className="text-right">
                  {formData.phase1Priority}
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
                  {formData.phase1Soak}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Respect schedule</TinyText>
                <SmallText className="text-right">
                  {formData.phase1RespectSchedule
                    ? "Enabled"
                    : "Disabled"}
                </SmallText>
              </div>

              <div className="flex items-start justify-between py-2">
                <TinyText muted>Safety brake</TinyText>
                <div className="flex items-center gap-2">
                  <SmallText className="text-right">
                    {formData.phase1SafetyBrake}% threshold
                  </SmallText>
                </div>
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
              Phase 2: General rollout
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Batch size</TinyText>
                <SmallText className="text-right">
                  {formData.phase2Batch} clusters at a time
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Max concurrency</TinyText>
                <SmallText className="text-right">
                  {formData.phase2MaxParallel} clusters in parallel
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted>Stop on failure</TinyText>
                <SmallText className="text-right">
                  {formData.phase2StopOnFailure
                    ? `Enabled (${formData.phase2FailureThreshold} cluster threshold)`
                    : "Disabled"}
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
            {formData.strategy === "canary"
              ? `This deployment will take approximately 5-7 days including soak times (${formData.phase1Soak} after Phase 1, during the configured schedule).`
              : "This deployment will proceed based on the configured schedule and strategy."}
          </TinyText>
        </div>
      </div>
    </div>
  );
}