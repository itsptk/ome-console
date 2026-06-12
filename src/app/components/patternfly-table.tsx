import { Checkbox } from "@patternfly/react-core";
import tableStyles from "@patternfly/react-styles/css/components/Table/table.mjs";
import { css } from "@patternfly/react-styles";
import { type ReactNode } from "react";

export type PfTableModifier =
  | "borderRow"
  | "compact"
  | "striped"
  | "stickyHeader"
  | "fixed";

export type PfCellWidth =
  | "fitContent"
  | "width10"
  | "width15"
  | "width20"
  | "width25"
  | "width30"
  | "width35"
  | "width40"
  | "width45"
  | "width50"
  | "width60"
  | "width70"
  | "width80"
  | "width90";

const modifierClass: Record<PfTableModifier, string> = {
  borderRow: tableStyles.modifiers.borderRow,
  compact: tableStyles.modifiers.compact,
  striped: tableStyles.modifiers.striped,
  stickyHeader: tableStyles.modifiers.stickyHeader,
  fixed: tableStyles.modifiers.fixed,
};

const cellWidthClass: Record<PfCellWidth, string> = {
  fitContent: tableStyles.modifiers.fitContent,
  width10: tableStyles.modifiers.width_10,
  width15: tableStyles.modifiers.width_15,
  width20: tableStyles.modifiers.width_20,
  width25: tableStyles.modifiers.width_25,
  width30: tableStyles.modifiers.width_30,
  width35: tableStyles.modifiers.width_35,
  width40: tableStyles.modifiers.width_40,
  width45: tableStyles.modifiers.width_45,
  width50: tableStyles.modifiers.width_50,
  width60: tableStyles.modifiers.width_60,
  width70: tableStyles.modifiers.width_70,
  width80: tableStyles.modifiers.width_80,
  width90: tableStyles.modifiers.width_90,
};

export function PfTable({
  children,
  modifiers = ["borderRow"],
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  modifiers?: PfTableModifier[];
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <table
      className={css(
        tableStyles.table,
        modifiers.map((m) => modifierClass[m]),
        className,
      )}
      aria-label={ariaLabel}
    >
      {children}
    </table>
  );
}

export function PfThead({ children }: { children: ReactNode }) {
  return <thead className={tableStyles.tableThead}>{children}</thead>;
}

export function PfTbody({ children }: { children: ReactNode }) {
  return <tbody className={tableStyles.tableTbody}>{children}</tbody>;
}

export function PfTr({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr className={css(tableStyles.tableTr, className)} onClick={onClick}>
      {children}
    </tr>
  );
}

export type PfThContent = "text" | "checkbox" | "help";

export function PfTh({
  children,
  isCheck,
  isAction,
  content = "text",
  helpAction,
  width,
  wrap,
  className,
}: {
  children?: ReactNode;
  isCheck?: boolean;
  isAction?: boolean;
  /** How header cell content is structured per Patternfly table guidelines. */
  content?: PfThContent;
  /** Tooltip or help control; use with `content="help"`. */
  helpAction?: ReactNode;
  width?: PfCellWidth;
  wrap?: boolean;
  className?: string;
}) {
  let cellContent: ReactNode = children;

  if (content === "checkbox") {
    cellContent = children;
  } else if (content === "help") {
    cellContent = (
      <div className={tableStyles.tableColumnHelp}>
        <span className={tableStyles.tableText}>{children}</span>
        {helpAction ? (
          <span className={tableStyles.tableColumnHelpAction}>
            {helpAction}
          </span>
        ) : null}
      </div>
    );
  } else if (children != null && children !== false) {
    cellContent = (
      <span className={tableStyles.tableText}>{children}</span>
    );
  }

  return (
    <th
      className={css(
        tableStyles.tableTh,
        isCheck && tableStyles.tableCheck,
        isAction && tableStyles.tableAction,
        content === "help" && tableStyles.modifiers.help,
        width && cellWidthClass[width],
        wrap && tableStyles.modifiers.wrap,
        className,
      )}
      scope="col"
      style={{ textAlign: isAction ? "end" : "start" }}
    >
      {cellContent}
    </th>
  );
}

export function PfTd({
  children,
  isCheck,
  isAction,
  width,
  wrap,
  className,
}: {
  children?: ReactNode;
  isCheck?: boolean;
  isAction?: boolean;
  width?: PfCellWidth;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <td
      className={css(
        tableStyles.tableTd,
        isCheck && tableStyles.tableCheck,
        isAction && tableStyles.tableAction,
        width && cellWidthClass[width],
        wrap && tableStyles.modifiers.wrap,
        className,
      )}
      style={{ textAlign: isAction ? "end" : "start" }}
    >
      {children}
    </td>
  );
}

export function PfTableCheckbox({
  id,
  "aria-label": ariaLabel,
  isChecked,
  isDisabled,
  onChange,
}: {
  id: string;
  "aria-label": string;
  isChecked: boolean;
  isDisabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      id={id}
      aria-label={ariaLabel}
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={(_event, checked) => onChange(checked)}
    />
  );
}
