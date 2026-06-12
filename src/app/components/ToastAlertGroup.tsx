import "@patternfly/react-core/dist/styles/base-no-reset.css";
import "@patternfly/react-styles/css/components/Alert/alert.css";
import "@patternfly/react-styles/css/components/Alert/alert-group.css";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
} from "@patternfly/react-core";

export type ToastAlert = {
  id: number;
  title: string;
  variant?: AlertVariant | "success" | "danger" | "warning" | "info";
};

const TOAST_TIMEOUT_MS = 8000;

export function ToastAlertGroup({
  alerts,
  onDismiss,
}: {
  alerts: ToastAlert[];
  onDismiss: (id: number) => void;
}) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <AlertGroup isToast isLiveRegion aria-label="Toast alerts">
      {alerts.map((toast) => (
        <Alert
          key={toast.id}
          variant={toast.variant ?? AlertVariant.success}
          title={toast.title}
          timeout={TOAST_TIMEOUT_MS}
          onTimeout={() => onDismiss(toast.id)}
          actionClose={
            <AlertActionCloseButton onClose={() => onDismiss(toast.id)} />
          }
        />
      ))}
    </AlertGroup>
  );
}
