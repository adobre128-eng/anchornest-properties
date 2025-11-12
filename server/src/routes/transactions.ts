import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(),0,1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;
  const where:any = { txnDate: { gte: from, lte: to } };
  if (propertyId) where.propertyId = propertyId;

  const txns = await prisma.transaction.findMany({
    where,
    include:{ property:true },
    orderBy:{ txnDate: "desc" }
  });

  const data = txns.map(t => ({
    id: t.id,
    txnDate: t.txnDate,
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    isCredit: t.isCredit,
    propertyName: t.property.name,
    memo: t.memo || ""
  }));
  res.json(data);
});

export default router;
