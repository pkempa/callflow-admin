import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200 ${className}`}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <p className={`text-sm text-muted-foreground text-gray-500 ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({
  children,
  className = "",
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

export const CardFooter: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);
