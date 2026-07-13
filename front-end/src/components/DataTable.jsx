import './DataTable.css';

// columns: [{ key, header, render?: (row) => node, align?: 'left'|'right'|'center' }]
export default function DataTable({ columns, data, emptyMessage = 'Aucune donnée disponible.', getRowKey }) {
  if (!data || data.length === 0) {
    return <p className="data-table-empty">{emptyMessage}</p>;
  }

  return (
    <div className="data-table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row) : index}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
