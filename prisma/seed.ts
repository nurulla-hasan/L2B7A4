import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/enums";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  try {
    console.log("🌱 Seeding database...");

    // ─── Categories ───────────────────────────────────────────────
    const categories = [
      { name: "Electrical" },
      { name: "Plumbing" },
      { name: "Cleaning" },
      { name: "Carpentry" },
      { name: "Painting" },
    ];

    const createdCategories = [];

    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: category.name },
      });

      if (!existing) {
        const created = await prisma.category.create({ data: category });
        createdCategories.push(created);
        console.log(`  ✅ Category created: ${created.name}`);
      } else {
        createdCategories.push(existing);
        console.log(`  ⏭️  Category skipped (already exists): ${existing.name}`);
      }
    }

    // ─── Admin User ───────────────────────────────────────────────
    const adminEmail = "admin@fixitnow.com";
    const adminPassword = "admin123";

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
      console.log(`  ✅ Admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`  ⏭️  Admin skipped (already exists): ${adminEmail}`);
    }

    // ─── Demo Customer ───────────────────────────────────────────
    const customerEmail = "customer@fixitnow.com";
    const customerPassword = "customer123";

    const existingCustomer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash(customerPassword, 12);
      await prisma.user.create({
        data: {
          name: "Demo Customer",
          email: customerEmail,
          password: hashedPassword,
          role: Role.CUSTOMER,
        },
      });
      console.log(`  ✅ Customer created: ${customerEmail} / ${customerPassword}`);
    } else {
      console.log(`  ⏭️  Customer skipped (already exists): ${customerEmail}`);
    }

    // ─── Demo Technician ─────────────────────────────────────────
    const technicianEmail = "technician@fixitnow.com";
    const technicianPassword = "technician123";

    const existingTechnician = await prisma.user.findUnique({
      where: { email: technicianEmail },
    });

    if (!existingTechnician) {
      const hashedPassword = await bcrypt.hash(technicianPassword, 12);
      const technician = await prisma.user.create({
        data: {
          name: "Demo Technician",
          email: technicianEmail,
          password: hashedPassword,
          role: Role.TECHNICIAN,
        },
      });
      await prisma.technicianProfile.create({
        data: {
          userId: technician.id,
          skills: "Plumbing, Electrical, General Repair",
          experience: "5+ years of professional experience",
          pricing: 500,
        },
      });
      console.log(`  ✅ Technician created: ${technicianEmail} / ${technicianPassword}`);
    } else {
      console.log(`  ⏭️  Technician skipped (already exists): ${technicianEmail}`);
    }

    console.log("✅ Seeding complete!");
    console.log("────────────────────────────");
    console.log("📋 Demo Credentials:");
    console.log("   Admin:      admin@fixitnow.com / admin123");
    console.log("   Customer:   customer@fixitnow.com / customer123");
    console.log("   Technician: technician@fixitnow.com / technician123");
    console.log("────────────────────────────");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
