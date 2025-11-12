import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/kpis", async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(),0,1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;

  const where:any = { txnDate: { gte: from, lte: to } };
  if (propertyId) where.propertyId = propertyId;

  const txns = await prisma.transaction.findMany({ where, include:{ property:true }});
  const currency = txns[0]?.property.currency ?? "GBP";
  const revenue = txns.filter(t=>t.isCredit).reduce((s,t)=> s + Number(t.amount), 0);
  const expenses = txns.filter(t=>!t.isCredit).reduce((s,t)=> s + Number(t.amount), 0);

  const map = new Map<string, { rev:number; exp:number }>();
  for (const t of txns){
    const k = `${t.txnDate.getFullYear()}-${String(t.txnDate.getMonth()+1).padStart(2,"0")}`;
    if (!map.has(k)) map.set(k, { rev:0, exp:0 });
    const row = map.get(k)!;
    t.isCredit ? (row.rev += Number(t.amount)) : (row.exp += Number(t.amount));
  }
  const labels = Array.from(map.keys()).sort();
  const series = { labels, revenue: labels.map(l=>map.get(l)!.rev), expenses: labels.map(l=>map.get(l)!.exp) };

  res.json({
    period: { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) },
    currency,
    kpis: { revenue, expenses, noi: revenue - expenses, occupancyPct: 0, arrears: 0 },
    series
  });
});

export default router;
