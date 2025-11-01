import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { FaEye, FaEdit, FaTruck, FaSearch } from 'react-icons/fa';
import { Order } from '../../utils/api';
import { COLORS, STATUS_COLORS } from '../../assets/colors';

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onAssignTransporter: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onView, onEdit, onAssignTransporter }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      pending: COLORS.warning,
      accepted: COLORS.info,
      in_transit: COLORS.info,
      delivered: COLORS.success,
      cancelled: COLORS.error,
    };
    return colors[status as keyof typeof colors] || COLORS.textSecondary;
  };

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ getValue }) => (
          <div className="font-medium text-gray-900">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'crop',
        header: 'Crop',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity (kg)',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600">{getValue<number>()}</div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price (ETB)',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600">{getValue<number>().toLocaleString()}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <span
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: `${getStatusColor(status)}20`,
                color: getStatusColor(status),
              }}
            >
              {status.replace('_', ' ').toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600">
            {new Date(getValue<Date>()).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => onView(order)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="View Details"
              >
                <FaEye />
              </button>
              <button
                onClick={() => onEdit(order)}
                className="p-1 text-green-600 hover:text-green-800"
                title="Edit Order"
              >
                <FaEdit />
              </button>
              {order.status === 'accepted' && !order.transporterId && (
                <button
                  onClick={() => onAssignTransporter(order)}
                  className="p-1 text-orange-600 hover:text-orange-800"
                  title="Assign Transporter"
                >
                  <FaTruck />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onView, onEdit, onAssignTransporter]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
