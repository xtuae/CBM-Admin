import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table = ({ children, className = '' }: TableProps) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader = ({ children }: TableHeaderProps) => {
  return (
    <thead>
      <tr className="border-b border-light">
        {children}
      </tr>
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

const TableBody = ({ children }: TableBodyProps) => {
  return <tbody>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

const TableRow = ({ children, className = '' }: TableRowProps) => {
  return (
    <tr className={`border-b border-light hover:bg-gray-50 ${className}`.trim()}>
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

const TableHead = ({ children, className = '' }: TableHeadProps) => {
  return (
    <th className={`text-left py-4 px-4 text-sm font-medium text-gray-600 ${className}`.trim()}>
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

const TableCell = ({ children, className = '' }: TableCellProps) => {
  return (
    <td className={`py-4 px-4 ${className}`.trim()}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
export default Table;
