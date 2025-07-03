import React from 'react';
import { motion } from 'framer-motion';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  mobilePriority?: boolean; // Show in mobile card view
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  className = '',
  emptyMessage = 'No data available',
  loading = false
}) => {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="p-6">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-neutral-400 dark:text-neutral-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No data found</h3>
          <p className="text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {data.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white ${column.className || ''}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4"
          >
            <div className="space-y-3">
              {columns
                .filter(column => column.mobilePriority !== false)
                .map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                      {column.label}
                    </dt>
                    <dd className={`text-sm text-neutral-900 dark:text-white text-right ${column.className || ''}`}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </dd>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable; 