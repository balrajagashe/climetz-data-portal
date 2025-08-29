'use client';
import { useState } from 'react';

export default function SeedPage() {
  const [email, setEmail] = useState('demo@climetz.in');
  const [password, setPassword] = useState('climetz123');
  const [role, setRole] = useState<'user'|'admin'|'superadmin'>('admin');
  const [msg, setMsg] = useState('');

  async function seed() {
    setMsg('Seeding...');
    try {
      const res = await fetch('/api/dev/seed-user', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, role })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setMsg(`✅ Seeded: ${json.user.email} (${json.user.role})`);
    } catch (e:any) {
      setMsg(`❌ ${e.message || e}`);
    }
  }

  return (
    <div className="card" style={{maxWidth:520, margin:'40px auto'}}>
      <h2>Seed Test User</h2>
      <p style={{opacity:.8}}>Use this once to create a login user. Disable afterwards.</p>
      <div className="space" />
      <div className="grid" style={{gap:12}}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <select className="input" value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>
        <button className="btn" onClick={seed}>Seed User</button>
      </div>
      <div className="space" />
      {msg && <div className="card">{msg}</div>}
      <div className="space" />
      <div style={{opacity:.7, fontSize:12}}>
        Security tip: After login works, set <code>DISABLE_SEED=true</code> in Replit Secrets or delete this page & API.
      </div>
    </div>
  );
}
