/**
 * Prototype / checkpoint affordances: **conceptual design pink** (`#FF13F0`) outline + white fill.
 * Tailwind class strings use literal `#FF13F0` so purge picks them up.
 */
import type { ToastClassnames } from "sonner";
import { CONCEPTUAL_DESIGN_PINK } from "../../conceptualDesignPink";

/** Same as `CONCEPTUAL_DESIGN_PINK` — for `style={{ borderColor }}` etc. */
export const PROTOTYPE_PINK = CONCEPTUAL_DESIGN_PINK;

/**
 * Sonner `classNames` for “this click is a prototype / design note” toasts
 * (e.g. Share, Request review) — hot pink border reads as a comment, not product chrome.
 * Product actions use normal `SecondaryButton` styling; only the toast is pink.
 */
export const prototypeInteractionToastClassNames: ToastClassnames = {
  toast:
    "!border-2 !border-[#FF13F0] !bg-white !text-foreground !shadow-md",
  title: "!text-foreground !text-sm !font-medium",
  description:
    "!text-[var(--muted-foreground)] !text-[13px] !leading-snug !opacity-100",
  closeButton:
    "!border !border-[#FF13F0] !bg-white !text-foreground hover:!bg-[#FFF5FD]",
  success: "!text-[#FF13F0]",
  default: "!text-foreground",
};
