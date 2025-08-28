'use client';
export default function Page(){
  const email = typeof window !== 'undefined' ? localStorage.getItem('climetz_email') || '' : '';
  function logout(){
    localStorage.removeItem('climetz_at');
    localStorage.removeItem('climetz_email');
    window.location.href='/login';
  }
  return (
    <div className="card" style={{maxWidth:480}}>
      <h3>Profile</h3>
      <div>Email: {email}</div>
      <div className="space" />
      <button className="btn" onClick={logout}>Logout</button>
    </div>
  );
}
