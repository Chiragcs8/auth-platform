import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_ROLES = ["Admin", "Vendor", "Client", "Support Staff", "Broker"];

async function main() {
  console.log("🌱 Seeding database...");

  // Create default roles
  console.log("Creating default roles...");
  for (const roleName of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
    console.log(`  ✓ Role: ${role.roleName} (${role.id})`);
  }

  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { roleName: "Admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found");
  }

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@authplatform.com" },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        fullName: "System Administrator",
        email: "admin@authplatform.com",
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        isVerified: true,
        isActive: true,
        profile: {
          create: {
            phone: "+1-555-0100",
            address: "100 Admin Street",
            city: "San Francisco",
            state: "CA",
            country: "United States",
            zipCode: "94102",
            bio: "System Administrator",
            companyName: "AuthPlatform Inc.",
            website: "https://authplatform.com",
          },
        },
      },
    });

    console.log(`  ✓ Admin user: ${adminUser.email} (${adminUser.id})`);
  } else {
    console.log("  → Admin user already exists, skipping");
  }

  // Create demo users for each role
  const demoUsers = [
    {
      name: "Vendor Demo",
      email: "vendor@authplatform.com",
      password: "Vendor@123456",
      role: "Vendor",
      profile: {
        phone: "+1-555-0200",
        city: "New York",
        state: "NY",
        country: "United States",
        companyName: "Vendor Solutions LLC",
        bio: "Demo vendor account",
      },
    },
    {
      name: "Client Demo",
      email: "client@authplatform.com",
      password: "Client@123456",
      role: "Client",
      profile: {
        phone: "+1-555-0300",
        city: "Chicago",
        state: "IL",
        country: "United States",
        bio: "Demo client account",
      },
    },
    {
      name: "Support Staff Demo",
      email: "support@authplatform.com",
      password: "Support@123456",
      role: "Support Staff",
      profile: {
        phone: "+1-555-0400",
        city: "Austin",
        state: "TX",
        country: "United States",
        department: "Technical Support",
        bio: "Demo support staff account",
      },
    },
    {
      name: "Broker Demo",
      email: "broker@authplatform.com",
      password: "Broker@123456",
      role: "Broker",
      profile: {
        phone: "+1-555-0500",
        city: "Boston",
        state: "MA",
        country: "United States",
        brokerage: "Premier Brokerage Services",
        bio: "Demo broker account",
      },
    },
  ];

  for (const demo of demoUsers) {
    const role = await prisma.role.findUnique({
      where: { roleName: demo.role },
    });

    if (!role) continue;

    const existingUser = await prisma.user.findUnique({
      where: { email: demo.email },
    });

    if (existingUser) {
      console.log(`  → ${demo.role} user already exists, skipping`);
      continue;
    }

    const passwordHash = await bcrypt.hash(demo.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: demo.name,
        email: demo.email,
        passwordHash,
        roleId: role.id,
        isVerified: true,
        isActive: true,
        profile: {
          create: demo.profile,
        },
      },
    });

    console.log(`  ✓ ${demo.role} user: ${user.email} (${user.id})`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });