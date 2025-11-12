
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, login } from "./api";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

type KPIs = {
  period: { from: string; to: string };
  currency: string;
  kpis: { revenue: number; expenses: number; noi: number; occupancyPct: number; arrears: number };
  series?: { labels: string[]; revenue: number[]; expenses: number[] };
};

type Txn = { id:string; txnDate:string; type:string; category:string; amount:number; isCredit:boolean; propertyName:string; memo?:string };

export default function App(){
  const [token, setToken] = useState(localStorage.getItem("token"));
  if (!token) return <Login onLogin={(t)=>{ localStorage.setItem("token", t); setToken(t); }} />;

  const [from] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10));
  const [to] = useState(() => new Date().toISOString().slice(0,10));

  const { data, isLoading } = useQuery<KPIs>({ queryKey:["kpis", from, to], queryFn: () => api(`/reports/kpis?from=${from}&to=${to}`) });
  const { data: txns } = useQuery<Txn[]>({ queryKey:["txns", from, to], queryFn: () => api(`/transactions?from=${from}&to=${to}`) });

  return (
    <div style={{ fontFamily:"Inter, system-ui, sans-serif", padding:24, maxWidth:1100, margin:"0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Anchor Nest Properties – Portfolio Overview</h1>
      <p style={{ color:"#555", marginTop:0 }}>Secure demo dashboard</p>

      {isLoading || !data ? <div>Loading…</div> : <>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:12 }}>
          <Kpi label="Revenue" value={data.kpis.revenue} currency={data.currency} />
          <Kpi label="Expenses" value={data.kpis.expenses} currency={data.currency} />
          <Kpi label="NOI" value={data.kpis.noi} currency={data.currency} />
          <Kpi label="Occupancy" value={data.kpis.occupancyPct} suffix="%" />
          <Kpi label="Arrears" value={data.kpis.arrears} currency={data.currency} />
        </div>

        {data.series && (
          <div style={{ marginTop:16, padding:16, border:"1px solid #eee", borderRadius:8 }}>
            <Line data={{ labels: data.series.labels, datasets:[
              { label:"Revenue", data:data.series.revenue },
              { label:"Expenses", data:data.series.expenses }
            ]}} />
          </div>
        )}
      </>}

      <h2 style={{ marginTop: 28 }}>Transactions</h2>
      {!txns ? <div>Loading…</div> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Property</th>
                <th style={th}>Type</th>
                <th style={th}>Category</th>
                <th style={{...th, textAlign:"right"}}>Amount</th>
                <th style={th}>Memo</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id}>
                  <td style={td}>{new Date(t.txnDate).toLocaleDateString()}</td>
                  <td style={td}>{t.propertyName}</td>
                  <td style={td}>{t.type}</td>
                  <td style={td}>{t.category}</td>
                  <td style={{...td, textAlign:"right"}}>{(t.isCredit?1:-1)*t.amount}</td>
                  <td style={td}>{t.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Login({ onLogin }:{ onLogin:(token:string)=>void }){
  const [email, setEmail] = useState("admin@anchornest.com");
  const [password, setPassword] = useState("Demo123!");
  const [err, setErr] = useState<string | null>(null);
  const submit = async (e:React.FormEvent) => { e.preventDefault(); setErr(null);
    try { const res = await login(email, password); onLogin(res.token) }
    catch (e:any) { setErr(e?.message || "Login failed") }
  };
  return (
    <div style={{ display:"grid", placeItems:"center", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ width:340, border:"1px solid #eee", padding:20, borderRadius:8 }}>
        <h2 style={{ marginTop:0, marginBottom:8 }}>Anchor Nest Properties</h2>
        <p style={{ marginTop:0, color:"#666" }}>Sign in to continue</p>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width:"100%", padding:8, margin:"6px 0 12px", border:"1px solid #ccc", borderRadius:6 }} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:"100%", padding:8, margin:"6px 0 12px", border:"1px solid #ccc", borderRadius:6 }} />
        {err && <div style={{ color:"crimson", marginBottom:8 }}>{err}</div>}
        <button type="submit" style={{ width:"100%", padding:10, borderRadius:6, border:"1px solid #222", background:"#222", color:"white" }}>Sign in</button>
      </form>
    </div>
  )
}

function Kpi({ label, value, currency, suffix }:{ label:string; value:number; currency?:string; suffix?:string }){
  const fmt = (n:number) => currency ? new Intl.NumberFormat(undefined,{style:"currency",currency}).format(n) : n.toLocaleString();
  return (
    <div style={{ border:"1px solid #eee", borderRadius:8, padding:12 }}>
      <div style={{ fontSize:13, color:"#666" }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600 }}>{suffix ? `${value.toFixed(1)}${suffix}` : fmt(value)}</div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign:"left", padding:"8px 10px", borderBottom:"1px solid #ddd", background:"#fafafa" }
const td: React.CSSProperties = { padding:"8px 10px", borderBottom:"1px solid #eee" }
