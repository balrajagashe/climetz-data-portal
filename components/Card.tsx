export default function Card({title, subtitle, children}:{title:string, subtitle?:string, children?:React.ReactNode}) {
  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div>
          <div style={{opacity:.8,fontSize:12}}>{subtitle}</div>
          <h3 style={{margin:'6px 0 10px'}}>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}
