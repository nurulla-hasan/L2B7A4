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

    console.log("✅ Seeding complete!");
    console.log("────────────────────────────");
    console.log("📋 Admin Credentials:");
    console.log("   Email   :", adminEmail);
    console.log("   Password:", adminPassword);
    console.log("────────────────────────────");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
