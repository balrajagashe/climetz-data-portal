'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type Form = { email:string; password:string };

export default function Page() {
  const { register, handleSubmit } = useForm<Form>();
  const r = useRouter();
  const onSubmit = async (data:Form) => {
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (!res.ok) return alert(await res.text());
    const json = await res.json();
    localStorage.setItem('climetz_at', json.accessToken);
    localStorage.setItem('climetz_email', json.user.email);
    r.replace('/locations');
  };
  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Sign in</h2>
      <div className="space" />
      <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:12}}>
        <input className="input" placeholder="Email" {...register('email', {required:true})}/>
        <input className="input" placeholder="Password" type="password" {...register('password', {required:true})}/>
        <button className="btn" type="submit">Log in</button>
      </form>
    </div>
  );
}
