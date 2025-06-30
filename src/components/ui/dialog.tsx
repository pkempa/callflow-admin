import React, { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
  >
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export const DialogDescription: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;

export const DialogFooter: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}
  >
    {children}
  </div>
);

export const DialogTrigger: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => <div className={className}>{children}</div>;
