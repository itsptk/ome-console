import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ConceptualLabel } from "../../../imports/ConceptualLabel-1";
import { Copy, Info, Check } from "lucide-react";
import type {
  ClaimMappingMode,
  DayOneConsoleConfig,
  ExternalRegistryProvider,
  SigningKeyRegistry,
} from "../../pages/day-one/dayOneConsoleConfig";

interface DayOneConfigurationScreenProps {
  onComplete: (config: DayOneConsoleConfig) => void;
}

export function DayOneConfigurationScreen({
  onComplete,
}: DayOneConfigurationScreenProps) {
  const [backingStore, setBackingStore] = useState("mysql");
  const [authProvider, setAuthProvider] = useState("htpasswd");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [issuerUrl, setIssuerUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [authConfigType, setAuthConfigType] = useState<
    "manual" | "automated"
  >("manual");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const redirectUri =
    "https://console.example.com/api/auth/callback";
  const [showIssuerHelp, setShowIssuerHelp] = useState(false);
  const [showClientIdHelp, setShowClientIdHelp] =
    useState(false);
  const [signingKeyRegistry, setSigningKeyRegistry] =
    useState<SigningKeyRegistry>("platform");
  const [externalRegistryProvider, setExternalRegistryProvider] =
    useState<ExternalRegistryProvider>("github");
  const [externalRegistryRef, setExternalRegistryRef] = useState("");
  const [claimMappingMode, setClaimMappingMode] =
    useState<ClaimMappingMode>("default");
  const [usernameClaim, setUsernameClaim] = useState("sub");

  useEffect(() => {
    if (signingKeyRegistry !== "external") return;
    setExternalRegistryRef((prev) => {
      const t = prev.trim();
      if (t !== "") return prev;
      if (externalRegistryProvider === "github") return "https://github.com";
      if (externalRegistryProvider === "gitlab") return "https://gitlab.com";
      return prev;
    });
  }, [signingKeyRegistry, externalRegistryProvider]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleComplete = () => {
    onComplete({
      backingStore,
      authProvider,
      authConfigType,
      issuerUrl,
      clientId,
      signingKeyRegistry,
      externalRegistryProvider:
        signingKeyRegistry === "external"
          ? externalRegistryProvider
          : undefined,
      externalRegistryRef:
        signingKeyRegistry === "external" ? externalRegistryRef : undefined,
      claimMappingMode,
      claimMappingCustom:
        claimMappingMode === "custom" ? usernameClaim.trim() : undefined,
      signingKeyPublished: signingKeyRegistry === "platform",
    });
  };

  return (
    <div
      className="min-h-full w-full flex justify-center items-start p-8 py-10"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-2xl p-8 border bg-card"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          boxShadow: "var(--elevation-md)",
        }}
      >
        <h1
          className="mb-2"
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Initial OpenShift Management Engine Setup
        </h1>
        <p
          className="mb-8 text-muted-foreground"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          Configure your console settings before first launch.
        </p>

        {/* Backing Store Section */}
        <div className="mb-8">
          <label
            className="block mb-4"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            1. Select backing store:
          </label>
          <div className="space-y-3">
            <label
              className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-secondary transition-colors"
              style={{
                borderRadius: "var(--radius)",
                borderColor:
                  backingStore === "mysql"
                    ? "var(--primary)"
                    : "var(--border)",
                backgroundColor:
                  backingStore === "mysql"
                    ? "var(--primary-foreground)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="backingStore"
                value="mysql"
                checked={backingStore === "mysql"}
                onChange={(e) =>
                  setBackingStore(e.target.value)
                }
                className="mt-0.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                MySQL
              </span>
            </label>
            <label
              className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-secondary transition-colors"
              style={{
                borderRadius: "var(--radius)",
                borderColor:
                  backingStore === "enterprisedb"
                    ? "var(--primary)"
                    : "var(--border)",
                backgroundColor:
                  backingStore === "enterprisedb"
                    ? "var(--primary-foreground)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="backingStore"
                value="enterprisedb"
                checked={backingStore === "enterprisedb"}
                onChange={(e) =>
                  setBackingStore(e.target.value)
                }
                className="mt-0.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Enterprise DB
              </span>
            </label>
          </div>
        </div>

        {/* Authentication Provider Section */}
        <div className="mb-8">
          <label
            className="block mb-4"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            2. Setup authentication provider:
          </label>

          {/* Segmented Button */}
          <div
            className="inline-flex border p-1 mb-4"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
          >
            <button
              onClick={() => setAuthConfigType("manual")}
              className="px-4 py-2 transition-colors"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
                borderRadius: "var(--radius)",
                backgroundColor:
                  authConfigType === "manual"
                    ? "var(--card)"
                    : "transparent",
                color:
                  authConfigType === "manual"
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                boxShadow:
                  authConfigType === "manual"
                    ? "var(--elevation-sm)"
                    : "none",
              }}
            >
              Manual configuration
            </button>
            <button
              onClick={() => setAuthConfigType("automated")}
              className="px-4 py-2 transition-colors"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
                borderRadius: "var(--radius)",
                backgroundColor:
                  authConfigType === "automated"
                    ? "var(--card)"
                    : "transparent",
                color:
                  authConfigType === "automated"
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                boxShadow:
                  authConfigType === "automated"
                    ? "var(--elevation-sm)"
                    : "none",
              }}
            >
              Automated configuration
            </button>
          </div>

          {/* Manual Configuration Fields */}
          {authConfigType === "manual" && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="issuer-url"
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    Issuer URL:
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() =>
                          setShowIssuerHelp(true)
                        }
                        onMouseLeave={() =>
                          setShowIssuerHelp(false)
                        }
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {showIssuerHelp && (
                        <div
                          className="absolute left-0 top-6 z-10 w-64 p-3 border bg-card shadow-lg"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            boxShadow: "var(--elevation-md)",
                          }}
                        >
                          <p
                            className="text-foreground"
                            style={{
                              fontFamily:
                                "var(--font-family-text)",
                              fontSize: "var(--text-xs)",
                            }}
                          >
                            The base URL of your OIDC provider
                            (e.g., Okta, Auth0).
                          </p>
                        </div>
                      )}
                    </div>
                  </span>
                </label>
                <input
                  id="issuer-url"
                  type="text"
                  value={issuerUrl}
                  onChange={(e) => setIssuerUrl(e.target.value)}
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
                  htmlFor="client-id"
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    Client ID:
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() =>
                          setShowClientIdHelp(true)
                        }
                        onMouseLeave={() =>
                          setShowClientIdHelp(false)
                        }
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {showClientIdHelp && (
                        <div
                          className="absolute left-0 top-6 z-10 w-64 p-3 border bg-card shadow-lg"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            boxShadow: "var(--elevation-md)",
                          }}
                        >
                          <p
                            className="text-foreground"
                            style={{
                              fontFamily:
                                "var(--font-family-text)",
                              fontSize: "var(--text-xs)",
                            }}
                          >
                            The unique identifier for this
                            application.
                          </p>
                        </div>
                      )}
                    </div>
                  </span>
                </label>
                <input
                  id="client-id"
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
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
                  htmlFor="redirect-uri"
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    Redirect URI:
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {showHelp && (
                        <div
                          className="absolute left-0 top-6 z-10 w-64 p-3 border bg-card shadow-lg"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            boxShadow: "var(--elevation-md)",
                          }}
                        >
                          <p
                            className="text-foreground"
                            style={{
                              fontFamily:
                                "var(--font-family-text)",
                              fontSize: "var(--text-xs)",
                            }}
                          >
                            Copy this URI and register it in
                            your Identity Provider's application
                            settings to allow the management
                            console to authenticate users.
                          </p>
                        </div>
                      )}
                    </div>
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    id="redirect-uri"
                    type="text"
                    value={redirectUri}
                    readOnly
                    className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                    }}
                  />
                  <button
                    onClick={handleCopy}
                    className="ml-2 px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    style={{
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={!issuerUrl || !clientId}
                  className="px-4 py-2 border transition-colors"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    backgroundColor:
                      issuerUrl && clientId
                        ? "var(--card)"
                        : "var(--muted)",
                    color:
                      issuerUrl && clientId
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    cursor:
                      issuerUrl && clientId
                        ? "pointer"
                        : "not-allowed",
                    opacity: issuerUrl && clientId ? 1 : 0.5,
                  }}
                >
                  Test connection
                </button>
              </div>
            </div>
          )}

          {/* Automated Configuration Placeholder */}
          {authConfigType === "automated" && (
            <div
              className="p-4 border bg-muted"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Automated configuration options would appear
                here
              </p>
            </div>
          )}
        </div>

        {/* Signing: public key registry */}
        <div className="mb-8">
          <label
            className="block mb-2"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            3. Signing: public key registry
          </label>
          <p
            className="mb-4 text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-xs)",
            }}
          >
            Choose where verification public keys are stored for signed
            artifacts and policies.
          </p>
          <div className="space-y-3">
            <label
              className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-secondary transition-colors"
              style={{
                borderRadius: "var(--radius)",
                borderColor:
                  signingKeyRegistry === "platform"
                    ? "var(--primary)"
                    : "var(--border)",
                backgroundColor:
                  signingKeyRegistry === "platform"
                    ? "var(--primary-foreground)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="signingKeyRegistry"
                value="platform"
                checked={signingKeyRegistry === "platform"}
                onChange={() => setSigningKeyRegistry("platform")}
                className="mt-0.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Platform (internal)
                </span>
                <p
                  className="text-muted-foreground mt-1"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Keys are managed and served by the OpenShift Management
                  Engine platform.
                </p>
              </div>
            </label>
            <label
              className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-secondary transition-colors"
              style={{
                borderRadius: "var(--radius)",
                borderColor:
                  signingKeyRegistry === "external"
                    ? "var(--primary)"
                    : "var(--border)",
                backgroundColor:
                  signingKeyRegistry === "external"
                    ? "var(--primary-foreground)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="signingKeyRegistry"
                value="external"
                checked={signingKeyRegistry === "external"}
                onChange={() => setSigningKeyRegistry("external")}
                className="mt-0.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  External registry
                </span>
                <p
                  className="text-muted-foreground mt-1"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Keys are published in an external system (for example
                  GitHub, GitLab, or a custom URL).
                </p>
              </div>
            </label>
          </div>

          {signingKeyRegistry === "external" && (
            <div className="mt-4 space-y-4 pl-1">
              <div>
                <span
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  External provider
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["github", "GitHub"],
                      ["gitlab", "GitLab"],
                      ["other", "Other / URL"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setExternalRegistryProvider(value)
                      }
                      className="px-3 py-1.5 border transition-colors"
                      style={{
                        fontFamily: "var(--font-family-text)",
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        borderRadius: "var(--radius)",
                        borderColor:
                          externalRegistryProvider === value
                            ? "var(--primary)"
                            : "var(--border)",
                        backgroundColor:
                          externalRegistryProvider === value
                            ? "var(--primary-foreground)"
                            : "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="external-registry-ref"
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Registry base URL
                </label>
                <input
                  id="external-registry-ref"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={externalRegistryRef}
                  onChange={(e) => setExternalRegistryRef(e.target.value)}
                  placeholder={
                    externalRegistryProvider === "github"
                      ? "https://github.com"
                      : externalRegistryProvider === "gitlab"
                        ? "https://gitlab.com"
                        : "https://registry.example.com"
                  }
                  className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                  }}
                />
                <p
                  className="mt-2 text-muted-foreground"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Use the registry&apos;s base URL only, not a repository or
                  project path.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Claim mapping */}
        <div className="mb-8">
          <label
            className="block mb-2"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            4. OIDC claim mapping
          </label>
          <p
            className="mb-4 text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-xs)",
            }}
          >
            Choose which OIDC token claim supplies the console username.
          </p>
          <div
            className="inline-flex border p-1 mb-4"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
          >
            <button
              type="button"
              onClick={() => setClaimMappingMode("default")}
              className="px-4 py-2 transition-colors"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
                borderRadius: "var(--radius)",
                backgroundColor:
                  claimMappingMode === "default"
                    ? "var(--card)"
                    : "transparent",
                color:
                  claimMappingMode === "default"
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                boxShadow:
                  claimMappingMode === "default"
                    ? "var(--elevation-sm)"
                    : "none",
              }}
            >
              Use platform defaults
            </button>
            <button
              type="button"
              onClick={() => setClaimMappingMode("custom")}
              className="px-4 py-2 transition-colors"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
                borderRadius: "var(--radius)",
                backgroundColor:
                  claimMappingMode === "custom"
                    ? "var(--card)"
                    : "transparent",
                color:
                  claimMappingMode === "custom"
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                boxShadow:
                  claimMappingMode === "custom"
                    ? "var(--elevation-sm)"
                    : "none",
              }}
            >
              Custom mapping
            </button>
          </div>
          {claimMappingMode === "custom" && (
            <div>
              <label
                htmlFor="username-claim"
                className="block mb-2"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Username claim
              </label>
              <input
                id="username-claim"
                type="text"
                value={usernameClaim}
                onChange={(e) => setUsernameClaim(e.target.value)}
                placeholder="sub"
                className="w-full max-w-md px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                }}
              />
            </div>
          )}
        </div>

        {/* Advanced Settings Section */}
        <div className="mb-8">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between hover:bg-secondary transition-colors"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            <span>Advanced Settings</span>
            <ChevronRight
              className={`w-5 h-5 transition-transform ${advancedOpen ? "rotate-90" : ""}`}
            />
          </button>

          {advancedOpen && (
            <div
              className="mt-3 p-4 border bg-muted"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Advanced configuration options would appear here
              </p>
            </div>
          )}
        </div>

        {/* Informational Message */}
        <div
          className="p-4 border mb-6 bg-muted/50"
          style={{
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            The console will restart after you press OK. You
            will need to authenticate with your chosen provider.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className="flex gap-3 justify-end pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            className="px-4 py-2 border hover:bg-secondary transition-colors"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
              borderRadius: "var(--radius)",
            }}
          >
            OK
          </button>
        </div>
      </div>

      <ConceptualLabel />
    </div>
  );
}