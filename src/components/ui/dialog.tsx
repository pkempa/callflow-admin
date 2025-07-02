import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  size = "md",
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} animate-scaleIn`}
      >
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
  showClose = true,
  onClose,
}) => (
  <div
    className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden ${className}`}
  >
    {showClose && onClose && (
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
      >
        <X className="h-4 w-4" />
      </button>
    )}
    {children}
  </div>
);

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const variantClasses = {
    default: "bg-slate-50 border-b border-slate-200",
    gradient:
      "bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200",
  };

  return (
    <div className={`px-6 py-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <h2
    className={`text-xl font-semibold text-slate-900 leading-tight ${className}`}
  >
    {children}
  </h2>
);

export const DialogDescription: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <p className={`text-sm text-slate-600 mt-2 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const DialogBody: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

export const DialogFooter: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3 ${className}`}
  >
    {children}
  </div>
);

export const DialogTrigger: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => <div className={className}>{children}</div>;
