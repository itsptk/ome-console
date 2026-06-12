import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ToastAlertGroup,
  type ToastAlert,
} from "../components/ToastAlertGroup";

type AppToastContextValue = {
  showSuccessToast: (title: string) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccessToast = useCallback((title: string) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), title, variant: "success" },
    ]);
  }, []);

  const value = useMemo(
    () => ({ showSuccessToast }),
    [showSuccessToast],
  );

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <ToastAlertGroup alerts={toasts} onDismiss={dismissToast} />
    </AppToastContext.Provider>
  );
}

export function useAppToast(): AppToastContextValue {
  const ctx = useContext(AppToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within AppToastProvider");
  }
  return ctx;
}
