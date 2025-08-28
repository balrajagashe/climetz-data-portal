'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Guard({ children }: { children: React.ReactNode }) {
  const r = useRouter();
  const [ok,setOk]=useState(false);
  useEffect(()=>{
    const at = localStorage.getItem('climetz_at');
    if (!at) r.replace('/login');
    else setOk(true);
  },[r]);
  return ok ? <>{children}</> : null;
}
