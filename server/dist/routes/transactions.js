"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;
    const where = { txnDate: { gte: from, lte: to } };
    if (propertyId)
        where.propertyId = propertyId;
    const txns = await prisma.transaction.findMany({
        where,
        include: { property: true },
        orderBy: { txnDate: "desc" }
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
exports.default = router;
