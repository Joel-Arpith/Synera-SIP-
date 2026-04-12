import React from 'react';

const Table = ({ columns, data, onRowClick, expandedRow }) => {
  return (
    <div className="overflow-x-auto">
      <table className="soc-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <React.Fragment key={row.id || rowIdx}>
              <tr 
                onClick={() => onRowClick && onRowClick(row)}
                className={expandedRow === row.id ? 'active' : ''}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
              {expandedRow === row.id && row.expandedContent && (
                <tr>
                  <td colSpan={columns.length} className="bg-[#0d0d14] p-0 border-b border-[#2a2a3a]">
                    <div className="animate-fade">
                      {row.expandedContent}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
