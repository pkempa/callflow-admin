import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
    destructive: "bg-red-100 text-red-800 border border-red-200",
    outline:
      "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    info: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    gradient:
      "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 shadow-sm",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Status-specific badge variants for common use cases
export const StatusBadge: React.FC<{
  status: "active" | "inactive" | "pending" | "error" | "success";
  className?: string;
}> = ({ status, className = "" }) => {
  const statusConfig = {
    active: { variant: "success" as const, text: "Active" },
    inactive: { variant: "secondary" as const, text: "Inactive" },
    pending: { variant: "warning" as const, text: "Pending" },
    error: { variant: "destructive" as const, text: "Error" },
    success: { variant: "success" as const, text: "Success" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></div>
      {config.text}
    </Badge>
  );
};

// Plan badge with custom styling
export const PlanBadge: React.FC<{
  plan: string;
  className?: string;
}> = ({ plan, className = "" }) => {
  const getPlanVariant = (planName: string) => {
    const planLower = planName.toLowerCase();
    if (planLower.includes("enterprise") || planLower.includes("pro")) {
      return "gradient";
    }
    if (planLower.includes("premium") || planLower.includes("plus")) {
      return "info";
    }
    if (planLower.includes("basic")) {
      return "default";
    }
    if (planLower.includes("free") || planLower.includes("trial")) {
      return "secondary";
    }
    return "default";
  };

  return (
    <Badge variant={getPlanVariant(plan)} className={className}>
      {plan}
    </Badge>
  );
};
