'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Form = { email:string; password:string };

export default function Page() {
  const { register, handleSubmit } = useForm<Form>();
  const r = useRouter();

  const onSubmit = async (data:Form) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return alert(await res.text());
    const json = await res.json();
    localStorage.setItem('climetz_at', json.accessToken);
    localStorage.setItem('climetz_email', json.user.email);
    r.replace('/locations');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <div className="card"
        style={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          padding: '40px 32px',
          background: 'rgba(17, 24, 39, 0.95)',  // slightly lighter dark
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          borderRadius: '12px'
        }}
      >
        <Image src="/climetzlogo.png" alt="Climetz" width={100} height={100} />
        <h2 style={{marginTop:20}}>Sign in</h2>
        <div className="space" />
        <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:16}}>
          <input className="input" placeholder="Email" {...register('email', {required:true})}/>
          <input className="input" placeholder="Password" type="password" {...register('password', {required:true})}/>
          <button className="btn" type="submit">Log in</button>
        </form>
      </div>
    </div>
  );
}
