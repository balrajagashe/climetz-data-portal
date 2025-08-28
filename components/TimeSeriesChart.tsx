'use client';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, TimeScale } from 'chart.js';
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function TimeSeriesChart({ series }:{ series:{ t:string|number; v:number }[] }) {
  const data = {
    labels: series.map(p=>p.t),
    datasets: [{ label:'Value', data: series.map(p=>p.v) }]
  };
  const options = { responsive:true, maintainAspectRatio:false };
  return <div style={{height:320}} className="card"><Line data={data} options={options}/></div>;
}
