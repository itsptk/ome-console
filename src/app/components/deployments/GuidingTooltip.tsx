"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { PROTOTYPE_PINK } from "./prototypeChrome";

type GuidingTooltipProps = {
  text: string;
  /** Shown in aria-label for the trigger */
  topic?: string;
};

/**
 * Compact “?” trigger for optional explanations (hot pink outline + white panel).
 * Use for product context, not for “this is demo / not real data” disclaimers.
 */
export function GuidingTooltip({ text, topic = "Details" }: GuidingTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-4 min-h-4 min-w-4 shrink-0 items-center justify-center rounded-full border bg-white p-0 text-[9px] font-bold leading-none shadow-sm"
          style={{
            borderColor: PROTOTYPE_PINK,
            color: PROTOTYPE_PINK,
            lineHeight: 1,
          }}
          aria-label={`${topic} — more information`}
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={4}
        showArrow={false}
        className="!z-[400] !max-w-xs !border-2 !border-[#FF13F0] !bg-white !px-2.5 !py-2 !text-left !text-[11px] !leading-snug !text-foreground !shadow-md"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
