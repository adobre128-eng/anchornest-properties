
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

function rand(min:number, max:number){ return Math.random()*(max-min)+min }
function pick<T>(xs:T[]){ return xs[Math.floor(Math.random()*xs.length)] }

async function main(){
  const company = await prisma.company.create({ data:{ name: "Anchor Nest Properties" }});
  const adminPass = await bcrypt.hash("Demo123!", 10);
  await prisma.user.create({ data:{ email:"admin@anchornest.com", passwordHash:adminPass, role:"ADMIN", companyId: company.id }});

  const properties = await Promise.all([
    { name:"Elm Street Apartments", address:"12 Elm St, London", currency:"GBP" },
    { name:"Riverside Villas", address:"4 River Way, Manchester", currency:"GBP" },
    { name:"Park View", address:"81 Park Ave, Bristol", currency:"GBP" },
    { name:"The Mews", address:"2 Mews Ln, Leeds", currency:"GBP" },
    { name:"Harbour House", address:"9 Quay Rd, Liverpool", currency:"GBP" }
  ].map(p => prisma.property.create({ data:{ ...p, companyId: company.id }})));

  for (const prop of properties){
    for (let i=1;i<=6;i++){
      const unit = await prisma.unit.create({ data:{ name:`Unit ${i}`, propertyId: prop.id }});
      const tenant = await prisma.tenant.create({ data:{ fullName:`Tenant ${prop.name.split(" ")[0]}-${i}` }});
      const start = new Date(); start.setMonth(start.getMonth()-Math.floor(rand(1,18)));
      await prisma.lease.create({ data:{
        unitId: unit.id, tenantId: tenant.id, start,
        rentMonthly: 800 + Math.floor(rand(0,400)), currency: prop.currency
      }});
    }
  }

  const allProps = await prisma.property.findMany();
  const leases = await prisma.lease.findMany();
  const categories = ["MAINTENANCE","UTILITIES","INSURANCE","MANAGEMENT_FEE"];
  const now = new Date();
  for (let m=0; m<12; m++){ 
    const dt = new Date(now.getFullYear(), now.getMonth()-m, 5);
    for (const lease of leases){
      const amount = Number(lease.rentMonthly);
      const unit = await prisma.unit.findUnique({ where:{ id: lease.unitId } });
      await prisma.transaction.create({ data:{
        propertyId: unit!.propertyId, leaseId: lease.id, txnDate: dt, type:"INVOICE", category:"RENT", amount, isCredit: true, memo:"Monthly rent"
      }});
    }
    for (const prop of allProps){
      const times = Math.floor(rand(1,3));
      for (let i=0;i<times;i++){ 
        await prisma.transaction.create({ data:{
          propertyId: prop.id, txnDate: new Date(dt.getFullYear(), dt.getMonth(), Math.floor(rand(6,25))),
          type:"EXPENSE", category: pick(categories), amount: Math.floor(rand(50,600)),
          isCredit: false, memo:"Vendor invoice"
        }});
      }
    }
  }
  console.log("Seeded sample data with admin@anchornest.com / Demo123!");
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
