export async function apiGet<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, {
    headers: token ? { Authorization:`Bearer ${token}` } : {},
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      ...(token ? { Authorization:`Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
