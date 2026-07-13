interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = "info",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClose,
  onConfirm
}: AlertModalProps) {
  if (!isOpen) return null;

  const showConfirmButtons = !!onConfirm;

  // Color theme selectors
  const getHeaderColorClass = () => {
    switch (type) {
      case "error":
        return "text-error";
      case "warning":
        return "text-warning";
      case "success":
        return "text-success";
      case "confirm":
        return "text-brand";
      default:
        return "text-text-primary";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center text-error">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "confirm":
        return (
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Modal Container */}
      <div className="relative bg-bg-surface border border-border-light rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <h3 className={`text-lg font-bold font-display tracking-tight ${getHeaderColorClass()}`}>
            {title}
          </h3>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-border-light/40">
          {showConfirmButtons ? (
            <>
              <button
                onClick={onClose}
                className="btn-secondary px-5 py-2 h-10 text-sm"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`px-5 py-2 h-10 rounded-md font-semibold text-sm cursor-pointer transition-all duration-150 ${
                  type === "error" || type === "warning"
                    ? "bg-error text-white hover:bg-error-hover"
                    : "btn-primary"
                }`}
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="btn-primary px-6 py-2 h-10 text-sm"
            >
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
