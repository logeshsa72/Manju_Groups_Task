import Spinner from "./Spinner";
import EmptyState from "./EmptyState";

// Generic, reusable table.
// columns: [{ header, accessor: (row) => node, className }]
export default function DataTable({ columns, data, loading, emptyTitle = "No records found", emptyDesc, keyField = "id" }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDesc} />;
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100">
            {columns.map((col, i) => (
              <th key={i} className={`text-left font-semibold text-ink-500 text-xs uppercase tracking-wide py-3 pr-4 ${col.headerClassName || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {data.map((row) => (
            <tr key={row[keyField]} className="hover:bg-ink-50/60 transition-colors">
              {columns.map((col, i) => (
                <td key={i} className={`py-3.5 pr-4 align-middle ${col.className || ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
