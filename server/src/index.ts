import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import reportsRouter from "./routes/reports";
import txnsRouter from "./routes/transactions";
import authRouter from "./routes/auth";
import { requireAuth } from "./routes/middleware";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "Anchor Nest Properties API" }));
app.use("/auth", authRouter);

// Protected routes
app.use("/reports", requireAuth, reportsRouter);
app.use("/transactions", requireAuth, txnsRouter);

app.get("/health", async (_req,res)=>{
  const count = await prisma.property.count();
  res.json({ status:"ok", properties: count });
});

app.listen(PORT, ()=> console.log(`API listening on http://localhost:${PORT}`));
