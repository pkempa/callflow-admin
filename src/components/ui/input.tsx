import React from "react";
import { AlertCircle, CheckCircle, Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "filled" | "outlined";
  inputSize?: "sm" | "md" | "lg";
  state?: "default" | "error" | "success" | "warning";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  variant = "default",
  inputSize = "md",
  state = "default",
  leftIcon,
  rightIcon,
  helperText,
  label,
  required = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variantClasses = {
    default:
      "bg-white border border-slate-300 focus:border-blue-500 focus:ring-blue-500",
    filled:
      "bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
    outlined:
      "bg-transparent border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const stateClasses = {
    default: "",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
    success:
      "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500",
    warning: "border-amber-300 focus:border-amber-500 focus:ring-amber-500",
  };

  const getStateIcon = () => {
    switch (state) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getHelperTextColor = () => {
    switch (state) {
      case "error":
        return "text-red-600";
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-amber-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          className={`
            block rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-slate-400
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${variantClasses[variant]}
            ${sizeClasses[inputSize]}
            ${stateClasses[state]}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon || getStateIcon() ? "pr-10" : ""}
            ${fullWidth ? "w-full" : ""}
            ${className}
          `}
          {...props}
        />

        {(rightIcon || getStateIcon()) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getStateIcon() || rightIcon}
          </div>
        )}
      </div>

      {helperText && (
        <p className={`mt-2 text-sm ${getHelperTextColor()}`}>{helperText}</p>
      )}
    </div>
  );
};

// Search input variant
export const SearchInput: React.FC<
  Omit<InputProps, "leftIcon"> & {
    onSearch?: (value: string) => void;
  }
> = ({ onSearch, ...props }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <Input
      leftIcon={<Search className="h-4 w-4 text-slate-400" />}
      placeholder="Search..."
      onKeyPress={handleKeyPress}
      {...props}
    />
  );
};

// Textarea component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: InputProps["variant"];
  inputSize?: InputProps["inputSize"];
  state?: InputProps["state"];
  helperText?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export const Textarea: React.FC<TextareaProps> = ({
  variant = "default",
  inputSize = "md",
  state = "default",
  helperText,
  label,
  required = false,
  fullWidth = false,
  resize = "vertical",
  className = "",
  ...props
}) => {
  const variantClasses = {
    default:
      "bg-white border border-slate-300 focus:border-blue-500 focus:ring-blue-500",
    filled:
      "bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
    outlined:
      "bg-transparent border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const stateClasses = {
    default: "",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
    success:
      "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500",
    warning: "border-amber-300 focus:border-amber-500 focus:ring-amber-500",
  };

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  const getHelperTextColor = () => {
    switch (state) {
      case "error":
        return "text-red-600";
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-amber-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        className={`
          block rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-slate-400
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[inputSize]}
          ${stateClasses[state]}
          ${resizeClasses[resize]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        rows={4}
        {...props}
      />

      {helperText && (
        <p className={`mt-2 text-sm ${getHelperTextColor()}`}>{helperText}</p>
      )}
    </div>
  );
};
