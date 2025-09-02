/**
 * CallFlow Admin Design System
 * Consistent UI components and styling for the admin interface
 */

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Color palette
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// Typography components
export const Typography = {
  H1: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "text-3xl font-bold text-gray-900 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  H2: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "text-2xl font-semibold text-gray-900 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  H3: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn("text-xl font-semibold text-gray-900", className)}
      {...props}
    >
      {children}
    </h3>
  ),
  Body: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-gray-700 leading-relaxed", className)} {...props}>
      {children}
    </p>
  ),
  Caption: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn("text-sm text-gray-500", className)} {...props}>
      {children}
    </span>
  ),
};

// Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  ...props
}) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-lg",
    outlined: "bg-white border-2 border-gray-300",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    danger: "bg-danger-600 hover:bg-danger-700 text-white shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

// Badge component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  icon?: LucideIcon;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  icon: Icon,
  ...props
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    danger: "bg-danger-100 text-danger-800",
    info: "bg-primary-100 text-primary-800",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            Icon && "pl-10",
            error && "border-danger-500 focus:ring-danger-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
};

// Loading spinner
export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin",
        sizes[size]
      )}
    />
  );
};

// Empty state component
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <Typography.H3 className="mb-2">{title}</Typography.H3>
      <Typography.Body className="mb-6 max-w-md mx-auto">
        {description}
      </Typography.Body>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
};

// Status indicator
interface StatusIndicatorProps {
  status: "online" | "offline" | "warning" | "error";
  label?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
}) => {
  const colors = {
    online: "bg-success-500",
    offline: "bg-gray-400",
    warning: "bg-warning-500",
    error: "bg-danger-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", colors[status])} />
      {label && <Typography.Caption>{label}</Typography.Caption>}
    </div>
  );
};

