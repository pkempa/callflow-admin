import React, { useState } from "react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            isOpen,
            setIsOpen,
          } as Record<string, unknown>);
        }
        return child;
      })}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  value?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
  isOpen,
  setIsOpen,
}) => (
  <button
    type="button"
    onClick={() => setIsOpen?.(!isOpen)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
    <svg
      className="h-4 w-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
);

interface SelectValueProps {
  placeholder?: string;
  value?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "Select...",
  value,
}) => <span>{value || placeholder}</span>;

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = "",
  isOpen,
  setIsOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen?.(false)} />
      <div
        className={`absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg ${className}`}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              setIsOpen,
            } as Record<string, unknown>);
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  setIsOpen?: (open: boolean) => void;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  onValueChange,
  setIsOpen,
}) => (
  <button
    type="button"
    onClick={() => {
      onValueChange?.(value);
      setIsOpen?.(false);
    }}
    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
  >
    {children}
  </button>
);
