
function getBase(){ return import.meta.env.VITE_API_URL || "http://localhost:4000"; }
function getToken(){ return localStorage.getItem("token"); }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string,string> = { "Content-Type": "application/json", ...(init.headers as any || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getBase()}${path}`, { ...init, headers });
  if (res.status === 401) { localStorage.removeItem("token"); location.reload(); }
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function login(email:string, password:string){
  const res = await fetch(`${getBase()}/auth/login`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ token:string; user:{ email:string; role:string } }>;
}
