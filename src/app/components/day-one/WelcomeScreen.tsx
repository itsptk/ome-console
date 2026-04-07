import { ChevronDown, Server, Brain, Code, Network } from "lucide-react";
import { ConceptualLabel } from "../../../imports/ConceptualLabel-1";
import { useState } from "react";

interface WelcomeScreenProps {
  onSkip: () => void;
  onCreateCluster: (type: string) => void;
}

export function WelcomeScreen({
  onSkip,
  onCreateCluster,
}: WelcomeScreenProps) {
  const [selectedType, setSelectedType] = useState<
    string | null
  >(null);

  const workloadTypes = [
    {
      id: "virtualization",
      name: "Virtualization",
      description:
        "Optimized for running VMs alongside containers.",
      icon: <Server className="w-8 h-8" />,
      color: "#004080",
      bgColor: "#8BC1F7",
      recommendedTopology:
        "3 Control Planes + 2 Large Worker Nodes",
    },
    {
      id: "ai-ml",
      name: "AI & Machine Learning",
      description:
        "Accelerated nodes for training and model serving.",
      icon: <Brain className="w-8 h-8" />,
      bgColor: "#EE0000",
      color: "#EE0000",
      recommendedTopology:
        "3 Control Planes + 1 GPU-enabled Worker Node",
    },
    {
      id: "app-dev",
      name: "Application Development",
      description:
        "Standard multi-tenant clusters for microservices.",
      icon: <Code className="w-8 h-8" />,
      bgColor: "#F0AB00",
      color: "#C58C00",
      recommendedTopology:
        "3 Control Planes + 3 Standard Worker Nodes",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="mb-4"
            style={{
              fontFamily: "var(--font-family-display)",
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Welcome to OpenShift Management Engine
          </h1>
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-lg)",
            }}
          >
            Let's create your first clusters. What kind of
            workload are you looking to run today?
          </p>
        </div>

        {/* Top Section: Workload Types */}
        <div className="mb-8">
          <h2
            className="mb-6"
            style={{
              fontFamily: "var(--font-family-display)",
              fontSize: "var(--text-xl)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            What workload are you looking to run today?
          </h2>

          {/* Workload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {workloadTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="p-6 border bg-card text-left group"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor:
                    selectedType === type.id
                      ? "var(--primary)"
                      : "var(--border)",
                  borderWidth:
                    selectedType === type.id ? "2px" : "1px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor:
                    selectedType === type.id
                      ? "var(--secondary)"
                      : "var(--card)",
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type.id) {
                    e.currentTarget.style.backgroundColor =
                      "var(--secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== type.id) {
                    e.currentTarget.style.backgroundColor =
                      "var(--card)";
                  }
                }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-4"
                  style={{
                    borderRadius: "var(--radius)",
                    backgroundColor: `${type.bgColor}20`,
                    color: type.color,
                  }}
                >
                  {type.icon}
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {type.name}
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {type.description}
                </p>
              </button>
            ))}
          </div>

          {/* Recommended Configuration */}
          {selectedType && (
            <div
              className="p-6 border"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
                backgroundColor: "var(--card)",
              }}
            >
              <h3
                className="mb-4"
                style={{
                  fontFamily: "var(--font-family-display)",
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Recommended Configuration
              </h3>

              <p
                className="mb-4"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {
                  workloadTypes.find(
                    (type) => type.id === selectedType,
                  )?.recommendedTopology
                }
              </p>

              {/* Placeholder bars for hardware specs */}
              <div className="space-y-2 mb-6">
                <div
                  className="h-3 w-full"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <div
                  className="h-3 w-3/4"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <div
                  className="h-3 w-5/6"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRadius: "var(--radius)",
                  }}
                />
              </div>

              <button
                onClick={() =>
                  selectedType === "virtualization"
                    ? onCreateCluster("bare-metal")
                    : undefined
                }
                className="px-4 py-2"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Create Cluster
              </button>
            </div>
          )}
        </div>

        {/* Middle Section: Scaling & Infrastructure */}
        <div className="mb-8">
          <h2
            className="mb-6"
            style={{
              fontFamily: "var(--font-family-display)",
              fontSize: "var(--text-xl)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Scaling & Infrastructure
          </h2>

          {/* Management Engine Card */}
          <div
            className="p-6 border bg-card"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor: "rgba(0, 102, 204, 0.1)",
                  color: "#0066CC",
                }}
              >
                <Network className="w-8 h-8" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  OpenShift Management Engine Cluster
                </h3>
                <p
                  className="text-muted-foreground mb-4"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    lineHeight: "1.6",
                  }}
                >
                  Offload your management engine and its add-ons to a dedicated, high-performance cluster as your fleet grows.
                </p>
                <button
                  onClick={() => onCreateCluster("management-cluster")}
                  className="px-4 py-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Setup a cluster for management
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Secondary Actions */}
        {/* All Cluster Types - Non-functional */}
        <div className="mb-8">
          <button
            className="w-full flex items-center justify-center gap-2 p-3 text-primary"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Select cluster type to create or import a cluster
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Skip Option */}
        <div
          className="text-center pt-6 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-muted-foreground mb-3"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Not ready to create add clusters?
          </p>
          <button
            onClick={onSkip}
            className="text-primary hover:underline"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Skip and go to dashboard
          </button>
        </div>
      </div>

      <ConceptualLabel />
    </div>
  );
}