const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const salesPassword = await bcrypt.hash("Sales@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@crm.com" },
    update: {},
    create: { name: "Admin User", email: "admin@crm.com", password: adminPassword, role: "ADMIN" },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@crm.com" },
    update: {},
    create: { name: "Sales Rep", email: "sales@crm.com", password: salesPassword, role: "SALES" },
  });

  const project = await prisma.project.create({
    data: {
      name: "Green Meadows",
      location: "Coimbatore",
      buildings: {
        create: [
          {
            name: "Tower A",
            units: {
              create: [
                { unitNo: "A-101", type: "APARTMENT", price: 4500000, status: "AVAILABLE" },
                { unitNo: "A-102", type: "APARTMENT", price: 4700000, status: "AVAILABLE" },
                { unitNo: "A-103", type: "APARTMENT", price: 5200000, status: "HOLD" },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.lead.createMany({
    data: [
      { name: "Ravi Kumar", phone: "9876543210", email: "ravi@example.com", stage: "NEW", assignedToId: sales.id, source: "Website" },
      { name: "Divya S", phone: "9876500000", email: "divya@example.com", stage: "SITE_VISIT", assignedToId: sales.id, source: "Referral" },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@crm.com / Admin@123");
  console.log("Sales login: sales@crm.com / Sales@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
