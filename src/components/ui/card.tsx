import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "glass";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const variantClasses = {
    default: "bg-white border border-slate-200 shadow-sm hover:shadow-md",
    elevated: "bg-white border border-slate-200 shadow-lg hover:shadow-xl",
    outlined:
      "bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md",
    glass: "glass-effect border-slate-200",
  };

  return (
    <div
      className={`rounded-xl transition-all duration-200 card-hover ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const variantClasses = {
    default:
      "bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200",
    elevated:
      "bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200",
    outlined:
      "bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200",
    glass: "backdrop-blur-sm border-b border-white/20",
  };

  return (
    <div
      className={`flex flex-col space-y-1.5 px-6 py-4 rounded-t-xl ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <h3
    className={`text-xl font-semibold leading-none tracking-tight text-slate-900 ${className}`}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <p className={`text-sm text-slate-600 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({
  children,
  className = "",
}) => <div className={`p-6 ${className}`}>{children}</div>;

export const CardFooter: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`flex items-center px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl ${className}`}
  >
    {children}
  </div>
);
