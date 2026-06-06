import "@patternfly/react-core/dist/styles/base-no-reset.css";
import {
  ActionList,
  ActionListItem,
  Alert,
  Button,
  Card,
  CardBody,
  ClipboardCopy,
  Content,
  Divider,
  ExpandableSection,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  Popover,
  Radio,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { useEffect, useState } from "react";
import { ConceptualLabel } from "../../../imports/ConceptualLabel-1";
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
  const redirectUri =
    "https://console.example.com/api/auth/callback";
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

  const issuerHelp = (
    <Popover
      headerContent={<div>Issuer URL</div>}
      bodyContent={
        <div>
          The base URL of your OIDC provider (e.g., Okta, Auth0).
        </div>
      }
    >
      <FormGroupLabelHelp aria-label="More information for issuer URL" />
    </Popover>
  );

  const clientIdHelp = (
    <Popover
      headerContent={<div>Client ID</div>}
      bodyContent={
        <div>The unique identifier for this application.</div>
      }
    >
      <FormGroupLabelHelp aria-label="More information for client ID" />
    </Popover>
  );

  const redirectHelp = (
    <Popover
      headerContent={<div>Redirect URI</div>}
      bodyContent={
        <div>
          Copy this URI and register it in your Identity Provider&apos;s
          application settings to allow the management console to authenticate
          users.
        </div>
      }
    >
      <FormGroupLabelHelp aria-label="More information for redirect URI" />
    </Popover>
  );

  return (
    <div
      className="min-h-full w-full flex justify-center items-start p-8 py-10"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Card
        className="w-full max-w-5xl"
        ouiaId="day-one-configuration-card"
      >
        <CardBody>
          <Title headingLevel="h1" size="2xl">
            Initial OpenShift Management Engine Setup
          </Title>
          <Content className="mt-2 mb-8">
            <p className="text-muted-foreground">
              Configure your console settings before first launch.
            </p>
          </Content>

          <section aria-labelledby="day-one-heading-backing-store">
            <Title
              id="day-one-heading-backing-store"
              headingLevel="h2"
              size="xl"
              className="mb-2"
            >
              Backing store
            </Title>
            <Content className="mb-4">
              <p className="text-sm text-muted-foreground">
                Select the database the console uses to persist configuration
                and operational state.
              </p>
            </Content>
            <Form>
              <FormGroup role="radiogroup" fieldId="backing-store" isStack>
                <Radio
                  id="backing-mysql"
                  name="backingStore"
                  label="MySQL"
                  isChecked={backingStore === "mysql"}
                  onChange={() => setBackingStore("mysql")}
                />
                <Radio
                  id="backing-enterprisedb"
                  name="backingStore"
                  label="Enterprise DB"
                  isChecked={backingStore === "enterprisedb"}
                  onChange={() => setBackingStore("enterprisedb")}
                />
              </FormGroup>
            </Form>
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="day-one-heading-auth-provider">
            <Title
              id="day-one-heading-auth-provider"
              headingLevel="h2"
              size="xl"
              className="mb-2"
            >
              Authentication provider
            </Title>
            <Content className="mb-4">
              <p className="text-sm text-muted-foreground">
                Choose how the console integrates with your identity provider
                for user sign-in (manual OIDC settings or automated setup).
              </p>
            </Content>
            <ToggleGroup
              aria-label="Configuration type"
              className="mb-4"
            >
              <ToggleGroupItem
                text="Manual configuration"
                isSelected={authConfigType === "manual"}
                onChange={(_e, selected) =>
                  selected && setAuthConfigType("manual")
                }
              />
              <ToggleGroupItem
                text="Automated configuration"
                isSelected={authConfigType === "automated"}
                onChange={(_e, selected) =>
                  selected && setAuthConfigType("automated")
                }
              />
            </ToggleGroup>

            {authConfigType === "manual" && (
              <Form className="mt-4" maxWidth="40rem">
                <FormGroup
                  fieldId="issuer-url"
                  label="Issuer URL"
                  labelHelp={issuerHelp}
                >
                  <TextInput
                    id="issuer-url"
                    type="text"
                    value={issuerUrl}
                    onChange={(_e, v) => setIssuerUrl(v)}
                  />
                </FormGroup>
                <FormGroup
                  fieldId="client-id"
                  label="Client ID"
                  labelHelp={clientIdHelp}
                >
                  <TextInput
                    id="client-id"
                    type="text"
                    value={clientId}
                    onChange={(_e, v) => setClientId(v)}
                  />
                </FormGroup>
                <FormGroup
                  fieldId="redirect-uri"
                  label="Redirect URI"
                  labelHelp={redirectHelp}
                >
                  <ClipboardCopy
                    isReadOnly
                    hoverTip="Copy to clipboard"
                    clickTip="Copied!"
                    variant="inline"
                    isBlock
                  >
                    {redirectUri}
                  </ClipboardCopy>
                </FormGroup>
                <FormGroup fieldId="test-connection">
                  <Button
                    variant="secondary"
                    isDisabled={!issuerUrl || !clientId}
                  >
                    Test connection
                  </Button>
                </FormGroup>
              </Form>
            )}

            {authConfigType === "automated" && (
              <Alert
                variant="info"
                isInline
                title="Automated configuration"
              >
                Automated configuration options would appear here.
              </Alert>
            )}
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="day-one-heading-signing-registry">
            <Title
              id="day-one-heading-signing-registry"
              headingLevel="h2"
              size="xl"
              className="mb-2"
            >
              Signing public key registry
            </Title>
            <Content className="mb-4">
              <p className="text-sm text-muted-foreground">
                Choose where verification public keys are stored for signed
                artifacts and policies.
              </p>
            </Content>
            <Form>
              <FormGroup
                role="radiogroup"
                fieldId="signing-key-registry"
                isStack
              >
                <Radio
                  id="signing-platform"
                  name="signingKeyRegistry"
                  label="IdP / OIDC-hosted keys"
                  description="Signing public keys are discovered through your OIDC identity provider—for example attributes or claims on IdP-issued tokens—not through a separate Git forge. Uses your existing IdP trust; distinct from console OAuth client configuration alone."
                  isChecked={signingKeyRegistry === "platform"}
                  onChange={() => setSigningKeyRegistry("platform")}
                />
                <Radio
                  id="signing-external"
                  name="signingKeyRegistry"
                  label="External registry"
                  description="Keys are published in an external system (for example GitHub, GitLab, or a custom URL). Different trust path than IdP-hosted discovery above—coordinate with your IdP or security team for key discovery and registry-specific setup."
                  isChecked={signingKeyRegistry === "external"}
                  onChange={() => setSigningKeyRegistry("external")}
                />
              </FormGroup>
            </Form>

            {signingKeyRegistry === "platform" && (
              <Form className="mt-4" maxWidth="40rem">
                <FormGroup
                  fieldId="fake-signer-binding"
                  label="Fake example field: signing key claim mapping"
                >
                  <TextInput
                    id="fake-signer-binding"
                    readOnly
                    readOnlyVariant="default"
                    value="e.g. sshPublicKey / custom attribute name (maps to OIDC claims)"
                    onChange={() => {}}
                  />
                </FormGroup>
                <FormGroup
                  fieldId="fake-extra-idp"
                  label="Fake example field: IdP issuer alignment"
                >
                  <TextInput
                    id="fake-extra-idp"
                    readOnly
                    readOnlyVariant="default"
                    value="Same issuer trust as console OIDC — verification uses IdP JWKS"
                    onChange={() => {}}
                  />
                </FormGroup>
              </Form>
            )}

            {signingKeyRegistry === "external" && (
              <Form className="mt-4" maxWidth="40rem">
                <FormGroup fieldId="external-provider" label="External provider">
                  <ToggleGroup aria-label="External registry provider">
                    <ToggleGroupItem
                      text="GitHub"
                      isSelected={externalRegistryProvider === "github"}
                      onChange={(_e, sel) =>
                        sel && setExternalRegistryProvider("github")
                      }
                    />
                    <ToggleGroupItem
                      text="GitLab"
                      isSelected={externalRegistryProvider === "gitlab"}
                      onChange={(_e, sel) =>
                        sel && setExternalRegistryProvider("gitlab")
                      }
                    />
                    <ToggleGroupItem
                      text="Other / URL"
                      isSelected={externalRegistryProvider === "other"}
                      onChange={(_e, sel) =>
                        sel && setExternalRegistryProvider("other")
                      }
                    />
                  </ToggleGroup>
                </FormGroup>
                <FormGroup fieldId="external-registry-ref" label="Registry base URL">
                  <TextInput
                    id="external-registry-ref"
                    type="url"
                    value={externalRegistryRef}
                    onChange={(_e, v) => setExternalRegistryRef(v)}
                    placeholder={
                      externalRegistryProvider === "github"
                        ? "https://github.com"
                        : externalRegistryProvider === "gitlab"
                          ? "https://gitlab.com"
                          : "https://registry.example.com"
                    }
                  />
                  <Content className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Use the registry&apos;s base URL only, not a repository or
                      project path.
                    </p>
                  </Content>
                </FormGroup>
              </Form>
            )}
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="day-one-heading-claim-mapping">
            <Title
              id="day-one-heading-claim-mapping"
              headingLevel="h2"
              size="xl"
              className="mb-2"
            >
              OIDC claim mapping
            </Title>
            <Content className="mb-4">
              <p className="text-sm text-muted-foreground">
                Choose which OIDC token claim supplies the console username.
              </p>
            </Content>
            <ToggleGroup
              aria-label="Claim mapping mode"
              className="mb-4"
            >
              <ToggleGroupItem
                text="Use platform defaults"
                isSelected={claimMappingMode === "default"}
                onChange={(_e, sel) =>
                  sel && setClaimMappingMode("default")
                }
              />
              <ToggleGroupItem
                text="Custom mapping"
                isSelected={claimMappingMode === "custom"}
                onChange={(_e, sel) =>
                  sel && setClaimMappingMode("custom")
                }
              />
            </ToggleGroup>
            {claimMappingMode === "custom" && (
              <Form maxWidth="40rem">
                <FormGroup fieldId="username-claim" label="Username claim">
                  <TextInput
                    id="username-claim"
                    type="text"
                    value={usernameClaim}
                    onChange={(_e, v) => setUsernameClaim(v)}
                    placeholder="sub"
                  />
                </FormGroup>
              </Form>
            )}
          </section>

          <Divider className="my-10" />

          <ExpandableSection
            toggleText="Advanced settings"
            isExpanded={advancedOpen}
            onToggle={(_e, expanded) => setAdvancedOpen(expanded)}
            className="mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Advanced configuration options would appear here
            </p>
          </ExpandableSection>

          <Alert
            variant="info"
            isInline
            isPlain
            title="Console restart"
            className="mb-6"
          >
            The console will restart after you press OK. You will need to
            authenticate with your chosen provider.
          </Alert>

          <Divider />
          <div className="flex justify-end pt-4">
            <ActionList>
              <ActionListItem>
                <Button variant="secondary">Cancel</Button>
              </ActionListItem>
              <ActionListItem>
                <Button variant="primary" onClick={handleComplete}>
                  OK
                </Button>
              </ActionListItem>
            </ActionList>
          </div>
        </CardBody>
      </Card>

      <ConceptualLabel />
    </div>
  );
}
