import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?:string; password?:string };
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId }, process.env.JWT_SECRET!, { expiresIn: "8h" });
  res.json({ token, user: { email: user.email, role: user.role } });
});

export default router;
