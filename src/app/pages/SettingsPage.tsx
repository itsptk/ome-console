import { Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  PageTitle,
  BodyText,
  Container,
} from "../../imports/UIComponents";
import {
  DEFAULT_RUN_AS_STORAGE_KEY,
  RUN_AS_PLATFORM_VALUE,
  RUN_AS_YOU_VALUE,
} from "../../imports/CreateClusterWizard";
import {
  readDayOneConsoleConfig,
  writeDayOneConsoleConfig,
} from "./day-one/dayOneConsoleConfig";
import { PasskeyEnrollmentMock } from "../components/signing/PasskeyEnrollmentMock";
import {
  GITHUB_SIGNING_PUB_KEY_STORAGE,
  clearPasskeyEnrollment,
  isPasskeyEnrollmentComplete,
  setPasskeyEnrollmentComplete,
} from "../signing/signingPrototypeState";

const ROTATION_OPTIONS = [
  { value: "manual", label: "Manual only (rotate when initiated)" },
  { value: "90d", label: "Every 90 days" },
  { value: "180d", label: "Every 180 days" },
  { value: "365d", label: "Every 365 days" },
] as const;

/** Preset service accounts (same names as Run as in Create cluster wizard). */
const INITIAL_SERVICE_ACCOUNTS: { id: string; name: string }[] = [
  { id: "sa-ome-system-manager", name: "ome-system-manager-sa" },
  { id: "sa-bulk-upgrade-worker", name: "bulk-upgrade-worker-v4" },
];

function serviceAccountRunAsValue(name: string): string {
  return `Service account: ${name}`;
}

const RUN_AS_OPTIONS: { value: string; label: string }[] = [
  { value: RUN_AS_PLATFORM_VALUE, label: "Platform" },
  { value: RUN_AS_YOU_VALUE, label: "You (cluster admin)" },
  ...INITIAL_SERVICE_ACCOUNTS.map((sa) => ({
    value: serviceAccountRunAsValue(sa.name),
    label: serviceAccountRunAsValue(sa.name),
  })),
];

function readStoredDefaultRunAs(): string {
  if (typeof sessionStorage === "undefined") {
    return RUN_AS_PLATFORM_VALUE;
  }
  try {
    const v = sessionStorage.getItem(DEFAULT_RUN_AS_STORAGE_KEY);
    if (v && RUN_AS_OPTIONS.some((o) => o.value === v)) return v;
  } catch {
    /* ignore */
  }
  return RUN_AS_PLATFORM_VALUE;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Illustrative OpenSSH-style signing public line (prototype only). */
function generateIllustrativeSigningPublicKey(): string {
  const buf = new Uint8Array(86);
  crypto.getRandomValues(buf);
  let tail = "";
  for (let i = 0; i < 86; i++) {
    tail += B64[buf[i]! % 64];
  }
  return `ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTI1NiAAAAIbmlzdHAyNTYAAABB${tail}=`;
}

export function SettingsPage() {
  const location = useLocation();
  const [published, setPublished] = useState(false);
  const [config, setConfig] = useState(readDayOneConsoleConfig());
  const [signingKeyDialogOpen, setSigningKeyDialogOpen] = useState(false);
  const [signingKeyDialogStep, setSigningKeyDialogStep] = useState<
    "pubkey" | "passkey"
  >("pubkey");
  const [generatedPublicKey, setGeneratedPublicKey] = useState<string | null>(
    null,
  );
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  /** Illustrative product setting — not wired to a backend in this prototype. */
  const [signingKeyRotationPolicy, setSigningKeyRotationPolicy] =
    useState<string>("90d");
  const [defaultRunAs, setDefaultRunAs] = useState<string>(readStoredDefaultRunAs);

  useEffect(() => {
    setConfig(readDayOneConsoleConfig());
  }, [location.key]);

  useEffect(() => {
    if (location.hash === "#prototype-setting") {
      document.getElementById("prototype-setting")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.hash, location.key]);

  useEffect(() => {
    if (config?.signingKeyRegistry === "external") {
      setPublished(config.signingKeyPublished === true);
    } else {
      setPublished(false);
    }
  }, [config]);

  const external = config?.signingKeyRegistry === "external";
  const externalGithub =
    external && config?.externalRegistryProvider === "github";

  useEffect(() => {
    if (!externalGithub || typeof sessionStorage === "undefined") return;
    try {
      const saved = sessionStorage.getItem(GITHUB_SIGNING_PUB_KEY_STORAGE);
      if (saved) setGeneratedPublicKey(saved);
    } catch {
      /* ignore */
    }
  }, [externalGithub]);

  const copyPublicKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const runGenerateSigningKeyPair = () => {
    const wasRegenerate = Boolean(generatedPublicKey);
    setIsGeneratingKey(true);
    window.setTimeout(() => {
      if (wasRegenerate) {
        clearPasskeyEnrollment();
        const c = readDayOneConsoleConfig();
        if (c?.signingKeyRegistry === "external") {
          writeDayOneConsoleConfig({ signingKeyPublished: false });
          setPublished(false);
          setConfig(readDayOneConsoleConfig());
        }
      }
      const key = generateIllustrativeSigningPublicKey();
      setGeneratedPublicKey(key);
      try {
        sessionStorage.setItem(GITHUB_SIGNING_PUB_KEY_STORAGE, key);
      } catch {
        /* ignore */
      }
      setIsGeneratingKey(false);
      setSigningKeyDialogStep("pubkey");
      setSigningKeyDialogOpen(true);
    }, 650);
  };

  const onPublishedChange = (checked: boolean) => {
    if (!config || !external) return;
    setPublished(checked);
    writeDayOneConsoleConfig({ signingKeyPublished: checked });
    setConfig(readDayOneConsoleConfig());
  };

  /** Prototype: mark key as published after the full generate + passkey flow completes. */
  const markSigningKeyPublishedAfterFlow = () => {
    const c = readDayOneConsoleConfig();
    if (c?.signingKeyRegistry !== "external") return;
    writeDayOneConsoleConfig({ signingKeyPublished: true });
    setPublished(true);
    setConfig(readDayOneConsoleConfig());
  };

  const onDefaultRunAsChange = (value: string) => {
    setDefaultRunAs(value);
    try {
      sessionStorage.setItem(DEFAULT_RUN_AS_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  };

  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Settings</PageTitle>
        <BodyText muted>
          Configure system preferences and options
        </BodyText>
      </div>

      <section
        className="mb-8 max-w-2xl rounded-lg border p-6"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="mb-2"
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Default execution identity
        </h2>
        <p
          className="mb-4 text-muted-foreground"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          Default for cluster operations when the wizard does not override it.
        </p>
        <label
          htmlFor="default-run-as"
          className="mb-2 block"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Run as
        </label>
        <select
          id="default-run-as"
          value={defaultRunAs}
          onChange={(e) => onDefaultRunAsChange(e.target.value)}
          className="max-w-md rounded-md border bg-background px-3 py-2"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            borderColor: "var(--border)",
          }}
        >
          {RUN_AS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      <section
        className="mb-8 max-w-2xl rounded-lg border p-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              className="mb-2"
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Service accounts
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              Accounts that can appear as Run as options for cluster operations.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            style={{
              fontFamily: "var(--font-family-text)",
              borderColor: "var(--border)",
            }}
          >
            Add service account
          </button>
        </div>

        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--muted)",
                }}
              >
                <th
                  className="px-4 py-3"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                  }}
                >
                  Name
                </th>
                <th
                  className="px-4 py-3 text-right"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_SERVICE_ACCOUNTS.map((sa) => (
                <tr
                  key={sa.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td
                    className="px-4 py-3"
                    style={{
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      color: "var(--foreground)",
                    }}
                  >
                    {sa.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="mb-8 max-w-2xl rounded-lg border p-6"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="mb-2"
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Signing and keys
        </h2>
        <p
          className="mb-6 text-muted-foreground"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          Controls you might ship for how the engine manages keys used to sign
          policies and artifacts.
        </p>

        <div>
          <label
            htmlFor="signing-key-rotation"
            className="mb-2 block"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Signing key rotation
          </label>
          <select
            id="signing-key-rotation"
            value={signingKeyRotationPolicy}
            onChange={(e) => setSigningKeyRotationPolicy(e.target.value)}
            className="max-w-md rounded-md border bg-background px-3 py-2"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              borderColor: "var(--border)",
            }}
          >
            {ROTATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p
            className="mt-2 text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-xs)",
            }}
          >
            Scheduled rotation generates a new key, publishes it according to your
            registry settings, and phases out the previous key. Manual rotation is
            for emergencies or compliance windows.
          </p>
        </div>

        {externalGithub && (
          <div
            className="mt-8 border-t pt-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="mb-1"
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              External signing key
            </h3>
            <h4
              className="mb-3 text-muted-foreground"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              GitHub
            </h4>
            <p
              className="mb-4 text-muted-foreground"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              Generate a signing key pair here, add the{" "}
              <strong className="font-medium text-foreground">
                public key
              </strong>{" "}
              to GitHub as a signing key, then register a passkey for console
              signing. Deployments only ask you to verify with your device after
              this one-time setup.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isGeneratingKey}
                onClick={runGenerateSigningKeyPair}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "var(--font-family-text)" }}
              >
                {isGeneratingKey
                  ? "Generating…"
                  : generatedPublicKey
                    ? "Regenerate signing key pair"
                    : "Generate signing key pair"}
              </button>
              {generatedPublicKey && !isGeneratingKey && (
                <button
                  type="button"
                  onClick={() => {
                    setSigningKeyDialogStep("pubkey");
                    setSigningKeyDialogOpen(true);
                  }}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    borderColor: "var(--border)",
                  }}
                >
                  Show public key and GitHub steps
                </button>
              )}
            </div>
            {generatedPublicKey && (
              <p
                className="mt-3 text-muted-foreground"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-xs)",
                }}
              >
                A key is stored for this browser session so you can reopen the
                instructions anytime.
                {isPasskeyEnrollmentComplete() ? (
                  <>
                    {" "}
                    <span className="font-medium text-foreground">
                      Passkey registered for console signing.
                    </span>
                  </>
                ) : null}
              </p>
            )}

            <Dialog
              open={signingKeyDialogOpen}
              onOpenChange={(open) => {
                setSigningKeyDialogOpen(open);
                if (!open) setSigningKeyDialogStep("pubkey");
              }}
            >
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                {signingKeyDialogStep === "pubkey" ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Your SSH signing public key</DialogTitle>
                      <DialogDescription>
                        Copy this entire line into GitHub as a{" "}
                        <strong className="text-foreground">Signing Key</strong>.
                        Then continue to register a passkey for deployments.
                      </DialogDescription>
                    </DialogHeader>

                    {generatedPublicKey && (
                      <>
                        <div className="relative">
                          <pre
                            className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md border bg-muted p-3 pr-12 font-mono text-xs text-foreground"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {generatedPublicKey}
                          </pre>
                          <button
                            type="button"
                            onClick={() => copyPublicKey(generatedPublicKey)}
                            className="absolute right-2 top-2 rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                            aria-label="Copy public key"
                          >
                            {copiedKey ? (
                              <Check className="size-4" aria-hidden />
                            ) : (
                              <Copy className="size-4" aria-hidden />
                            )}
                          </button>
                        </div>

                        <ol
                          className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground"
                          style={{ fontFamily: "var(--font-family-text)" }}
                        >
                          <li>
                            Open GitHub:{" "}
                            <strong className="font-medium text-foreground">
                              Settings
                            </strong>{" "}
                            →{" "}
                            <strong className="font-medium text-foreground">
                              SSH and GPG keys
                            </strong>{" "}
                            →{" "}
                            <strong className="font-medium text-foreground">
                              New SSH key
                            </strong>
                            .
                          </li>
                          <li>
                            Set{" "}
                            <strong className="font-medium text-foreground">
                              Key type
                            </strong>{" "}
                            to{" "}
                            <strong className="font-medium text-foreground">
                              Signing Key
                            </strong>
                            , paste the public key above, title it (for example
                            &quot;OME signing&quot;), and save.
                          </li>
                          <li>
                            <a
                              href="https://github.com/settings/ssh/new"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              Open GitHub: new SSH key
                            </a>
                          </li>
                        </ol>
                      </>
                    )}

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setSigningKeyDialogOpen(false)}
                        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                        style={{
                          fontFamily: "var(--font-family-text)",
                          borderColor: "var(--border)",
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigningKeyDialogStep("passkey")}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                        style={{ fontFamily: "var(--font-family-text)" }}
                      >
                        Continue to passkey setup
                      </button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>Register a passkey</DialogTitle>
                      <DialogDescription>
                        One-time setup for console signing. After this, deployments
                        only prompt for verification (for example fingerprint).
                      </DialogDescription>
                    </DialogHeader>
                    <PasskeyEnrollmentMock
                      titleId="settings-passkey-title"
                      onEnrollmentComplete={() => {
                        setPasskeyEnrollmentComplete();
                        markSigningKeyPublishedAfterFlow();
                        setSigningKeyDialogOpen(false);
                        setSigningKeyDialogStep("pubkey");
                      }}
                      onCancel={() => setSigningKeyDialogStep("pubkey")}
                    />
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </section>

      <section
        id="prototype-setting"
        className="max-w-2xl rounded-lg border p-6"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="mb-2"
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Prototype setting
        </h2>
        <p
          className="mb-6 text-muted-foreground"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          The following exists only for this prototype, not for a shipped product.
        </p>

        {!config ? (
          <p
            className="text-muted-foreground"
            style={{ fontFamily: "var(--font-family-text)", fontSize: "var(--text-sm)" }}
          >
            No day-one console configuration found in this session. Complete the
            initial setup flow to use signing options here.
          </p>
        ) : !external ? (
          <p
            className="text-muted-foreground"
            style={{ fontFamily: "var(--font-family-text)", fontSize: "var(--text-sm)" }}
          >
            Signing keys are managed by the platform. Marking a key as published
            applies only when you use an external registry.
          </p>
        ) : (
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => onPublishedChange(e.target.checked)}
              className="mt-1 size-4 shrink-0"
              style={{ accentColor: "var(--primary)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              Signing key published to external registry
            </span>
          </label>
        )}
      </section>
    </Container>
  );
}
