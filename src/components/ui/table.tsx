import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "striped" | "bordered";
}

export const Table: React.FC<TableProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const variantClasses = {
    default: "",
    striped: "[&_tbody_tr:nth-child(even)]:bg-slate-50/50",
    bordered: "border border-slate-200 rounded-lg overflow-hidden",
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table
        className={`w-full caption-bottom text-sm ${variantClasses[variant]} ${className}`}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <thead
    className={`bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 ${className}`}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <tbody className={`divide-y divide-slate-200 ${className}`}>{children}</tbody>
);

export const TableFooter: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <tfoot
    className={`bg-slate-50 border-t border-slate-200 font-medium ${className}`}
  >
    {children}
  </tfoot>
);

export const TableRow: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <tr
    className={`transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-blue-50 ${className}`}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <th
    className={`h-12 px-4 text-left align-middle font-semibold text-slate-700 text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <td
    className={`px-4 py-3 align-middle text-slate-900 [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </td>
);

export const TableCaption: React.FC<TableProps> = ({
  children,
  className = "",
}) => (
  <caption className={`mt-4 text-sm text-slate-600 ${className}`}>
    {children}
  </caption>
);

// Enhanced table variants for specific use cases
export const DataTable: React.FC<{
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}> = ({
  children,
  className = "",
  loading = false,
  empty = false,
  emptyMessage = "No data available",
}) => {
  if (loading) {
    return (
      <div className="w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center">
          <div className="text-slate-500">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <Table className={className} variant="striped">
      {children}
    </Table>
  );
};
