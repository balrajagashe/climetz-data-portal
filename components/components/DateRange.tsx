'use client';
import dayjs from 'dayjs';

export default function DateRange({ value, onChange }:{
  value:{from:string,to:string}, onChange:(v:{from:string,to:string})=>void
}) {
  return (
    <div className="row">
      <input className="input" type="date" value={value.from} onChange={e=>onChange({...value,from:e.target.value})}/>
      <input className="input" type="date" value={value.to} onChange={e=>onChange({...value,to:e.target.value})}/>
      <button className="btn" onClick={()=>{
        onChange({from: dayjs().subtract(7,'day').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD')});
      }}>Last 7 days</button>
    </div>
  );
}
