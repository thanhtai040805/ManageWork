import React from "react";
import { createRoot } from "react-dom/client";
import { X, AlertTriangle } from "lucide-react";

let confirmRoot = null;
let confirmContainer = null;

function ConfirmModalContent({
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) {
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const variantStyles = {
    default: "bg-slate-900",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
  };

  const buttonStyles = variantStyles[variant] || variantStyles.default;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {(variant === "danger" || variant === "warning") && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${variant === "danger" ? "bg-rose-100" : "bg-amber-100"}`}>
                <AlertTriangle size={20} className={variant === "danger" ? "text-rose-500" : "text-amber-500"} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{message}</p>
            </div>
            <button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 bg-slate-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm ${buttonStyles} hover:opacity-90`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function confirm(options = {}) {
  const {
    title = "Confirm",
    message = "Are you sure?",
    confirmText = "OK",
    cancelText = "Cancel",
    variant = "default",
  } = options;

  return new Promise((resolve) => {
    if (!confirmContainer) {
      confirmContainer = document.createElement("div");
      confirmContainer.id = "confirm-modal-root";
      document.body.appendChild(confirmContainer);
      confirmRoot = createRoot(confirmContainer);
    }

    const handleConfirm = () => {
      resolve(true);
      confirmRoot.render(null);
    };

    const handleCancel = () => {
      resolve(false);
      confirmRoot.render(null);
    };

    confirmRoot.render(
      <ConfirmModalContent
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
}