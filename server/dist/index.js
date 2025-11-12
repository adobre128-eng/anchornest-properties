"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const reports_1 = __importDefault(require("./routes/reports"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const auth_1 = __importDefault(require("./routes/auth"));
const middleware_1 = require("./routes/middleware");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.get("/", (_req, res) => res.json({ ok: true, name: "Anchor Nest Properties API" }));
app.use("/auth", auth_1.default);
// Protected routes
app.use("/reports", middleware_1.requireAuth, reports_1.default);
app.use("/transactions", middleware_1.requireAuth, transactions_1.default);
app.get("/health", async (_req, res) => {
    const count = await prisma.property.count();
    res.json({ status: "ok", properties: count });
});
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
