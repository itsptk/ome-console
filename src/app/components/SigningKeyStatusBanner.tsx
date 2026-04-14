import { Info } from "lucide-react";
import { Link } from "react-router";
import { useConsoleCapabilities } from "../contexts/ConsoleCapabilitiesContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

/** Soft yellow banner (not theme tokens) so it reads clearly as a notice strip. */
const BANNER_BG = "#faf6e8";
const BANNER_BORDER = "#e6dcae";

export function SigningKeyStatusBanner() {
  const { isReadOnlyMode, externalProviderLabel } = useConsoleCapabilities();
  if (!isReadOnlyMode) return null;

  return (
    <div
      role="alert"
      className="shrink-0 overflow-x-auto border-b px-4 py-1.5"
      style={{
        borderColor: BANNER_BORDER,
        backgroundColor: BANNER_BG,
        fontFamily: "var(--font-family-text)",
        fontSize: "var(--text-sm)",
        color: "var(--foreground)",
      }}
    >
      <div className="inline-flex max-w-none flex-nowrap items-center gap-x-1.5">
        <span className="whitespace-nowrap">
          Signing keys use an external registry ({externalProviderLabel}). Until
          your public key is published and your passkey is registered in Settings,
          you can&apos;t choose{" "}
          <strong className="font-semibold">Platform Service</strong> under{" "}
          <strong className="font-semibold">Run as</strong> for deployments.
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
              aria-label="Why Platform Service is unavailable"
            >
              <Info className="size-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={6}
            className="z-[60] w-[min(22rem,calc(100vw-2rem))] text-pretty p-3 text-sm"
          >
            <p className="m-0 text-popover-foreground">
              Choosing <strong className="font-semibold">Platform Service</strong>{" "}
              under <strong className="font-semibold">Run as</strong> for a
              deployment uses the platform&apos;s managed identity. You complete
              passkey registration in Settings alongside publishing your signing
              key to the registry.
            </p>
          </PopoverContent>
        </Popover>
        <Link
          to="/settings"
          className="whitespace-nowrap font-medium text-primary underline-offset-2 hover:underline"
        >
          Complete signing setup
        </Link>
      </div>
    </div>
  );
}
