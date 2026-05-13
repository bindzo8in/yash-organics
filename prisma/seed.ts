import { PrismaClient, Role } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // 1. ADMIN USER
  // =========================
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@yashorganics.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@yashorganics.com",
      phone: "9999999999",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Admin created:", admin.email);

  // =========================
  // 2. MAIN CATEGORIES
  // =========================
  const fruits = await prisma.category.upsert({
    where: {
      slug: "organic-fruits",
    },
    update: {},
    create: {
      name: "Organic Fruits",
      slug: "organic-fruits",
      description: "Fresh and organic fruits directly from farm.",
      image:
        "https://images.unsplash.com/photo-1610832958506-aa56338406cd",
    },
  });

  const vegetables = await prisma.category.upsert({
    where: {
      slug: "organic-vegetables",
    },
    update: {},
    create: {
      name: "Organic Vegetables",
      slug: "organic-vegetables",
      description: "Pure organic vegetables.",
      image:
        "https://images.unsplash.com/photo-1566385101042-1a000c1267c4",
    },
  });

  // =========================
  // 3. SUB CATEGORIES
  // =========================
  const mangoes = await prisma.category.upsert({
    where: {
      slug: "mangoes",
    },
    update: {},
    create: {
      name: "Mangoes",
      slug: "mangoes",
      description: "King of fruits.",
      image:
        "https://images.unsplash.com/photo-1553279768-865429fa0078",
      parentId: fruits.id,
    },
  });

  const leafyGreens = await prisma.category.upsert({
    where: {
      slug: "leafy-greens",
    },
    update: {},
    create: {
      name: "Leafy Greens",
      slug: "leafy-greens",
      description: "Spinach, Kale and more.",
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999",
      parentId: vegetables.id,
    },
  });

  // =========================
  // 4. PRODUCTS
  // =========================

  // ALPHONSO MANGO
  const alphonsoMango = await prisma.product.upsert({
    where: {
      slug: "alphonso-mango",
    },
    update: {},
    create: {
      name: "Alphonso Mango",
      slug: "alphonso-mango",
      description: "Premium Ratnagiri Alphonso Mangoes.",
      categoryId: mangoes.id,

      productImages: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1553279768-865429fa0078",
            alt: "Alphonso Mango",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },

      variants: {
        create: [
          {
            name: "500g",
            mrp: 180,
            price: 150,
            stock: 50,
            lowStockLevel: 5,
            weight: 0.5,
            unit: "kg",
          },
          {
            name: "1kg",
            mrp: 320,
            price: 280,
            stock: 30,
            lowStockLevel: 5,
            weight: 1,
            unit: "kg",
          },
        ],
      },
    },
  });

  console.log("✅ Product created:", alphonsoMango.name);

  // ORGANIC SPINACH
  const spinach = await prisma.product.upsert({
    where: {
      slug: "organic-spinach",
    },
    update: {},
    create: {
      name: "Organic Spinach",
      slug: "organic-spinach",
      description: "Fresh organic spinach leaves.",
      categoryId: leafyGreens.id,

      productImages: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1523450001312-daa4e2e12444",
            alt: "Organic Spinach",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },

      variants: {
        create: [
          {
            name: "250g",
            mrp: 50,
            price: 40,
            stock: 100,
            lowStockLevel: 10,
            weight: 0.25,
            unit: "kg",
          },
          {
            name: "500g",
            mrp: 90,
            price: 75,
            stock: 80,
            lowStockLevel: 10,
            weight: 0.5,
            unit: "kg",
          },
        ],
      },
    },
  });

  console.log("✅ Product created:", spinach.name);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });