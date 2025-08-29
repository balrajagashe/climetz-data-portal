'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [email,setEmail]=useState<string>('');

  useEffect(()=>{
    setEmail(localStorage.getItem('climetz_email') || '');
  },[]);

  // Don’t show header at all on login page
  if (pathname === '/login') return null;

  return (
    <header className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
      <div className="row">
        <Image src="/climetzlogo.png" alt="Climetz" width={36} height={36}/>
        <strong>Climetz Data Portal</strong>
      </div>
      <nav className="row" style={{gap:16}}>
        <Link href="/locations">Locations</Link>
        <Link href="/reports">Reports</Link>
        <Link href="/profile" className="badge">{email || 'Profile'}</Link>
      </nav>
    </header>
  );
}
