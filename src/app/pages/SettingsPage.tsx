import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  PageTitle,
  BodyText,
  Container,
} from "../../imports/UIComponents";
import {
  readDayOneConsoleConfig,
  writeDayOneConsoleConfig,
} from "./day-one/dayOneConsoleConfig";

const ROTATION_OPTIONS = [
  { value: "manual", label: "Manual only (rotate when initiated)" },
  { value: "90d", label: "Every 90 days" },
  { value: "180d", label: "Every 180 days" },
  { value: "365d", label: "Every 365 days" },
] as const;

export function SettingsPage() {
  const location = useLocation();
  const [published, setPublished] = useState(false);
  const [config, setConfig] = useState(readDayOneConsoleConfig());
  /** Illustrative product setting — not wired to a backend in this prototype. */
  const [signingKeyRotationPolicy, setSigningKeyRotationPolicy] =
    useState<string>("90d");

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

  const onPublishedChange = (checked: boolean) => {
    if (!config || !external) return;
    setPublished(checked);
    writeDayOneConsoleConfig({ signingKeyPublished: checked });
    setConfig(readDayOneConsoleConfig());
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
