type Col = { key: string; label: string; render?: (v:any,row:any)=>React.ReactNode };
export default function DataTable({ rows, columns }: { rows:any[]; columns:Col[] }) {
  return (
    <div className="card">
      <table className="table">
        <thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              {columns.map(c=><td key={c.key}>{c.render? c.render(r[c.key], r): String(r[c.key]??'')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
