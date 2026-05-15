import { PrismaClient, Role, TransactionType } from "../app/generated/prisma/client";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for production seed`);
  }

  return value;
}

const isProduction = process.env.NODE_ENV === "production";

const adminSeed = {
  name: process.env.SEED_ADMIN_NAME || "YASH Admin",
  email: isProduction
    ? getRequiredEnv("SEED_ADMIN_EMAIL")
    : process.env.SEED_ADMIN_EMAIL || "admin@yashorganics.com",
  phone: isProduction
    ? getRequiredEnv("SEED_ADMIN_PHONE")
    : process.env.SEED_ADMIN_PHONE || "9999999999",
  password: isProduction
    ? getRequiredEnv("SEED_ADMIN_PASSWORD")
    : process.env.SEED_ADMIN_PASSWORD || "admin123",
};

// const productImages = [
//   "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200",
//   "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200",
//   "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
//   "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200",
//   "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200",
//   "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1200",
//   "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1200",
//   "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200",
//   "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200",
//   "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200",
// ];

// const parents = [
//   {
//     name: "Hair Care",
//     slug: "hair-care",
//     description:
//       "Natural herbal hair care products for strong, healthy, and nourished hair.",
//     image:
//       "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200",
//     order: 1,
//   },
//   {
//     name: "Skin Care",
//     slug: "skin-care",
//     description: "Gentle herbal skincare products made with natural ingredients.",
//     image:
//       "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
//     order: 2,
//   },
//   {
//     name: "Natural Essentials",
//     slug: "natural-essentials",
//     description:
//       "Premium dry fruits, spices, seeds, tea, and daily natural wellness essentials.",
//     image:
//       "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200",
//     order: 3,
//   },
// ];

// const children = [
//   {
//     parentSlug: "hair-care",
//     name: "Hair Oils",
//     slug: "hair-oils",
//     description:
//       "Herbal oils for scalp nourishment, shine, and healthy-looking hair.",
//     image:
//       "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200",
//     order: 1,
//   },
//   {
//     parentSlug: "hair-care",
//     name: "Hair Powders",
//     slug: "hair-powders",
//     description: "Traditional herbal powders for natural hair care routines.",
//     image:
//       "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200",
//     order: 2,
//   },
//   {
//     parentSlug: "skin-care",
//     name: "Face Care",
//     slug: "face-care",
//     description:
//       "Natural gels, packs, creams, toners, and scrubs for daily skincare.",
//     image:
//       "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
//     order: 1,
//   },
//   {
//     parentSlug: "skin-care",
//     name: "Body Care",
//     slug: "body-care",
//     description:
//       "Natural body lotions, butters, bath powders, and body wash products.",
//     image:
//       "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200",
//     order: 2,
//   },
//   {
//     parentSlug: "natural-essentials",
//     name: "Dry Fruits",
//     slug: "dry-fruits",
//     description: "Premium dry fruits packed with freshness, taste, and nutrition.",
//     image:
//       "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200",
//     order: 1,
//   },
//   {
//     parentSlug: "natural-essentials",
//     name: "Spices",
//     slug: "spices",
//     description: "Aromatic Indian spices for taste, health, and traditional cooking.",
//     image:
//       "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200",
//     order: 2,
//   },
//   {
//     parentSlug: "natural-essentials",
//     name: "Natural Sweeteners",
//     slug: "natural-sweeteners",
//     description:
//       "Natural sweeteners like jaggery, palm sugar, honey, and country sugar.",
//     image:
//       "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200",
//     order: 3,
//   },
//   {
//     parentSlug: "natural-essentials",
//     name: "Herbal Tea",
//     slug: "herbal-tea",
//     description:
//       "Refreshing herbal teas made with natural herbs, flowers, and spices.",
//     image:
//       "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200",
//     order: 4,
//   },
//   {
//     parentSlug: "natural-essentials",
//     name: "Seeds",
//     slug: "seeds",
//     description:
//       "Nutritious seeds for smoothies, salads, breakfast, and daily wellness.",
//     image:
//       "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
//     order: 5,
//   },
// ];

// const productTemplates = [
//   {
//     categorySlug: "hair-oils",
//     names: [
//       "Herbal Hair Oil",
//       "Amla Hair Oil",
//       "Bhringraj Hair Oil",
//       "Hibiscus Hair Oil",
//       "Onion Hair Oil",
//       "Coconut Hair Oil",
//       "Neem Hair Oil",
//       "Fenugreek Hair Oil",
//       "Curry Leaf Hair Oil",
//       "Aloe Hair Oil",
//       "Rosemary Hair Oil",
//       "Castor Hair Oil",
//       "Jasmine Hair Oil",
//       "Black Seed Hair Oil",
//       "Tea Tree Hair Oil",
//     ],
//     description:
//       "Natural herbal hair oil crafted to nourish the scalp, support healthy hair growth, and improve shine.",
//     ingredients:
//       "Coconut Oil, Amla, Bhringraj, Hibiscus, Fenugreek, Curry Leaves, Neem Extract.",
//     benefits:
//       "Helps nourish scalp, reduce dryness, support hair strength, improve shine, and promote healthy-looking hair.",
//     usage:
//       "Apply gently to scalp and hair. Massage for 5-10 minutes. Leave for at least 1 hour or overnight, then wash with mild shampoo.",
//     variants: [
//       { name: "100ml", mrp: 249, sellingPrice: 199, weight: 100, unit: "ml" },
//       { name: "200ml", mrp: 449, sellingPrice: 349, weight: 200, unit: "ml" },
//     ],
//   },
//   {
//     categorySlug: "hair-powders",
//     names: [
//       "Amla Powder",
//       "Hibiscus Powder",
//       "Bhringraj Powder",
//       "Shikakai Powder",
//       "Reetha Powder",
//       "Neem Hair Powder",
//       "Fenugreek Hair Powder",
//       "Curry Leaf Powder",
//       "Herbal Hair Wash Powder",
//       "Natural Hair Pack Powder",
//     ],
//     description:
//       "Traditional herbal hair powder made with natural ingredients for gentle hair care.",
//     ingredients:
//       "Dried Herbal Extracts, Amla, Hibiscus, Bhringraj, Shikakai, Reetha, Neem.",
//     benefits:
//       "Supports scalp freshness, natural cleansing, hair softness, and healthy-looking hair.",
//     usage:
//       "Mix with water, curd, or aloe gel to form a paste. Apply to scalp and hair. Rinse after 20-30 minutes.",
//     variants: [
//       { name: "100g", mrp: 149, sellingPrice: 119, weight: 100, unit: "g" },
//       { name: "250g", mrp: 299, sellingPrice: 249, weight: 250, unit: "g" },
//     ],
//   },
//   {
//     categorySlug: "face-care",
//     names: [
//       "Aloe Vera Skin Gel",
//       "Rose Face Gel",
//       "Neem Face Pack",
//       "Sandalwood Face Pack",
//       "Turmeric Face Pack",
//       "Charcoal Face Pack",
//       "Multani Mitti Face Pack",
//       "Honey Face Gel",
//       "Saffron Face Gel",
//       "Green Tea Face Gel",
//       "Vitamin E Face Cream",
//       "Herbal Face Cream",
//       "Natural Face Scrub",
//       "Rose Water Toner",
//       "Aloe Face Wash",
//     ],
//     description:
//       "Gentle skincare product made with natural ingredients for daily freshness and glow.",
//     ingredients:
//       "Aloe Vera Extract, Rose Water, Neem, Turmeric, Sandalwood, Vitamin E, Natural Base.",
//     benefits:
//       "Helps hydrate skin, reduce dryness, refresh dull skin, and support a natural glow.",
//     usage: "Apply on clean skin. Use daily or as directed. Avoid contact with eyes.",
//     variants: [
//       { name: "100g", mrp: 199, sellingPrice: 149, weight: 100, unit: "g" },
//       { name: "250g", mrp: 399, sellingPrice: 299, weight: 250, unit: "g" },
//     ],
//   },
//   {
//     categorySlug: "body-care",
//     names: [
//       "Herbal Body Lotion",
//       "Aloe Body Lotion",
//       "Coconut Body Butter",
//       "Shea Body Butter",
//       "Rose Body Lotion",
//       "Sandal Body Lotion",
//       "Neem Body Wash",
//       "Aloe Body Wash",
//       "Natural Bath Powder",
//       "Herbal Bath Powder",
//     ],
//     description:
//       "Natural body care product designed for soft, fresh, and nourished skin.",
//     ingredients:
//       "Aloe Vera, Coconut Extract, Shea Butter, Rose Water, Neem Extract, Natural Oils.",
//     benefits:
//       "Helps moisturize skin, reduce dryness, refresh body, and support smooth skin texture.",
//     usage: "Apply after bath or whenever needed. Massage gently until absorbed.",
//     variants: [
//       { name: "100ml", mrp: 199, sellingPrice: 159, weight: 100, unit: "ml" },
//       { name: "250ml", mrp: 399, sellingPrice: 329, weight: 250, unit: "ml" },
//     ],
//   },
//   {
//     categorySlug: "dry-fruits",
//     names: [
//       "Premium Badam",
//       "Premium Pista",
//       "Cashew Nuts",
//       "Walnuts",
//       "Raisins",
//       "Black Raisins",
//       "Dates",
//       "Dry Figs",
//       "Apricots",
//       "Mixed Dry Fruits",
//       "Roasted Badam",
//       "Salted Pista",
//       "Raw Cashews",
//       "Seedless Dates",
//       "Premium Anjeer",
//       "Trail Mix",
//       "Almond Slices",
//       "Pista Kernels",
//       "Dry Fruit Combo",
//       "Healthy Nut Mix",
//     ],
//     description:
//       "Premium quality dry fruits packed with natural nutrition, freshness, and rich taste.",
//     ingredients: "100% premium dry fruits. No artificial color or added preservatives.",
//     benefits:
//       "Rich in protein, fiber, healthy fats, vitamins, minerals, and natural energy.",
//     usage:
//       "Eat directly as a snack, soak overnight, or add to milk, sweets, smoothies, and desserts.",
//     variants: [
//       { name: "250g", mrp: 399, sellingPrice: 349, weight: 250, unit: "g" },
//       { name: "500g", mrp: 749, sellingPrice: 649, weight: 500, unit: "g" },
//       { name: "1kg", mrp: 1399, sellingPrice: 1199, weight: 1, unit: "kg" },
//     ],
//   },
//   {
//     categorySlug: "spices",
//     names: [
//       "Organic Turmeric Powder",
//       "Red Chilli Powder",
//       "Coriander Powder",
//       "Black Pepper",
//       "Cumin Seeds",
//       "Fennel Seeds",
//       "Mustard Seeds",
//       "Cardamom",
//       "Cloves",
//       "Cinnamon",
//       "Bay Leaf",
//       "Garam Masala",
//       "Sambar Powder",
//       "Rasam Powder",
//       "Chicken Masala",
//       "Mutton Masala",
//       "Biryani Masala",
//       "Pepper Powder",
//       "Jeera Powder",
//       "Kitchen King Masala",
//     ],
//     description:
//       "Aromatic Indian spice made for rich flavor, natural aroma, and traditional cooking.",
//     ingredients: "Natural spice ingredients cleaned, dried, and packed hygienically.",
//     benefits: "Adds taste, aroma, color, and traditional goodness to everyday cooking.",
//     usage:
//       "Use in curries, soups, rice dishes, gravies, and traditional recipes as required.",
//     variants: [
//       { name: "100g", mrp: 99, sellingPrice: 79, weight: 100, unit: "g" },
//       { name: "250g", mrp: 199, sellingPrice: 159, weight: 250, unit: "g" },
//       { name: "500g", mrp: 349, sellingPrice: 299, weight: 500, unit: "g" },
//     ],
//   },
//   {
//     categorySlug: "natural-sweeteners",
//     names: [
//       "Organic Jaggery Powder",
//       "Palm Sugar",
//       "Country Sugar",
//       "Rock Candy",
//       "Natural Honey",
//       "Raw Honey",
//       "Palm Jaggery",
//       "Jaggery Cubes",
//       "Date Syrup",
//       "Herbal Honey",
//     ],
//     description:
//       "Natural sweetener option for daily use, drinks, sweets, and traditional recipes.",
//     ingredients: "Natural sweetener source packed hygienically without artificial color.",
//     benefits: "Useful as a natural alternative for sweetening drinks, foods, and desserts.",
//     usage: "Use in tea, coffee, milk, sweets, porridge, desserts, and homemade recipes.",
//     variants: [
//       { name: "250g", mrp: 199, sellingPrice: 149, weight: 250, unit: "g" },
//       { name: "500g", mrp: 349, sellingPrice: 279, weight: 500, unit: "g" },
//     ],
//   },
//   {
//     categorySlug: "herbal-tea",
//     names: [
//       "Tulsi Herbal Tea",
//       "Green Tea",
//       "Hibiscus Tea",
//       "Chamomile Tea",
//       "Moringa Tea",
//       "Lemongrass Tea",
//       "Ginger Tea",
//       "Masala Tea",
//       "Detox Herbal Tea",
//       "Rose Tea",
//     ],
//     description:
//       "Refreshing herbal tea blend made with natural herbs for a soothing daily drink.",
//     ingredients: "Natural tea leaves, herbs, spices, flowers, and herbal extracts.",
//     benefits:
//       "Helps refresh the body, support relaxation, and provide a soothing beverage experience.",
//     usage: "Add to hot water. Steep for 3-5 minutes. Strain and serve warm.",
//     variants: [
//       { name: "50g", mrp: 149, sellingPrice: 119, weight: 50, unit: "g" },
//       { name: "100g", mrp: 249, sellingPrice: 199, weight: 100, unit: "g" },
//     ],
//   },
//   {
//     categorySlug: "seeds",
//     names: [
//       "Chia Seeds",
//       "Flax Seeds",
//       "Pumpkin Seeds",
//       "Sunflower Seeds",
//       "Sesame Seeds",
//       "Watermelon Seeds",
//       "Basil Seeds",
//       "Mixed Seeds",
//       "Quinoa Seeds",
//       "Healthy Seed Mix",
//     ],
//     description:
//       "Nutritious seeds for daily wellness, smoothies, salads, and healthy snacking.",
//     ingredients: "100% natural edible seeds packed hygienically.",
//     benefits:
//       "Good source of fiber, plant protein, healthy fats, minerals, and daily nutrition.",
//     usage:
//       "Add to smoothies, breakfast bowls, salads, curd, juices, or consume as recommended.",
//     variants: [
//       { name: "100g", mrp: 149, sellingPrice: 119, weight: 100, unit: "g" },
//       { name: "250g", mrp: 299, sellingPrice: 249, weight: 250, unit: "g" },
//     ],
//   },
// ];

// const heroSlides = [
//   {
//     title: "Pure Herbal Care for Everyday Wellness",
//     subtitle: "Natural Hair & Skin Care",
//     description:
//       "Discover premium herbal products crafted with natural ingredients for healthy hair, glowing skin, and daily wellness.",
//     image:
//       "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1600",
//     link: "/products",
//     ctaText: "Shop Now",
//     order: 1,
//     isActive: true,
//   },
//   {
//     title: "Premium Dry Fruits & Natural Essentials",
//     subtitle: "Fresh. Healthy. Natural.",
//     description:
//       "Shop high-quality badam, pista, spices, seeds, and natural essentials for your home.",
//     image:
//       "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1600",
//     link: "/category/natural-essentials",
//     ctaText: "Explore Products",
//     order: 2,
//     isActive: true,
//   },
//   {
//     title: "Traditional Goodness in Every Product",
//     subtitle: "YASH Organics",
//     description: "Made for customers who prefer pure, trusted, and natural products.",
//     image:
//       "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600",
//     link: "/about",
//     ctaText: "Know More",
//     order: 3,
//     isActive: true,
//   },
// ];

// async function upsertVariant(params: {
//   productId: string;
//   name: string;
//   mrp?: number | null;
//   sellingPrice: number;
//   stock: number;
//   lowStockLevel: number;
//   weight?: number | null;
//   unit?: string | null;
// }) {
//   const existingVariant = await prisma.productVariant.findFirst({
//     where: {
//       productId: params.productId,
//       name: params.name,
//     },
//   });

//   if (existingVariant) {
//     return prisma.productVariant.update({
//       where: { id: existingVariant.id },
//       data: {
//         mrp: params.mrp,
//         sellingPrice: params.sellingPrice,
//         lowStockLevel: params.lowStockLevel,
//         weight: params.weight,
//         unit: params.unit,
//         isActive: true,
//         // Do not overwrite stock in production after real sales start.
//       },
//     });
//   }

//   const variant = await prisma.productVariant.create({
//     data: {
//       productId: params.productId,
//       name: params.name,
//       mrp: params.mrp,
//       sellingPrice: params.sellingPrice,
//       stock: params.stock,
//       lowStockLevel: params.lowStockLevel,
//       weight: params.weight,
//       unit: params.unit,
//       isActive: true,
//     },
//   });

//   await prisma.stockTransaction.create({
//     data: {
//       productId: params.productId,
//       variantId: variant.id,
//       quantity: params.stock,
//       type: TransactionType.RESTOCK,
//       reason: "Initial production seed stock",
//     },
//   });

//   return variant;
// }

// async function ensureProductImage(params: {
//   productId: string;
//   url: string;
//   alt: string;
//   isPrimary: boolean;
//   sortOrder: number;
// }) {
//   const existingImage = await prisma.productImage.findFirst({
//     where: {
//       productId: params.productId,
//       url: params.url,
//     },
//   });

//   if (existingImage) {
//     return prisma.productImage.update({
//       where: { id: existingImage.id },
//       data: {
//         alt: params.alt,
//         isPrimary: params.isPrimary,
//         sortOrder: params.sortOrder,
//       },
//     });
//   }

//   return prisma.productImage.create({
//     data: params,
//   });
// }

async function main() {
  console.log("🌱 Production seed started...");
  console.log("⚠️ This seed does not delete users, orders, carts, or payments.");

  const adminPassword = await bcrypt.hash(adminSeed.password, 10);

  await prisma.user.upsert({
    where: { email: adminSeed.email },
    update: {
      name: adminSeed.name,
      phone: adminSeed.phone,
      role: Role.ADMIN,
      isVerified: true,
    },
    create: {
      name: adminSeed.name,
      email: adminSeed.email,
      phone: adminSeed.phone,
      password: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log("✅ Admin user ready");

  // const parentCategoryMap = new Map<string, { id: string; slug: string }>();

  // for (const parent of parents) {
  //   const category = await prisma.category.upsert({
  //     where: { slug: parent.slug },
  //     update: {
  //       name: parent.name,
  //       description: parent.description,
  //       image: parent.image,
  //       order: parent.order,
  //       isActive: true,
  //       parentId: null,
  //     },
  //     create: {
  //       name: parent.name,
  //       slug: parent.slug,
  //       description: parent.description,
  //       image: parent.image,
  //       order: parent.order,
  //       isActive: true,
  //     },
  //     select: {
  //       id: true,
  //       slug: true,
  //     },
  //   });

  //   parentCategoryMap.set(category.slug, category);
  // }

  // const childCategoryMap = new Map<string, { id: string; slug: string }>();

  // for (const child of children) {
  //   const parent = parentCategoryMap.get(child.parentSlug);

  //   if (!parent) {
  //     throw new Error(`Parent category missing for ${child.slug}`);
  //   }

  //   const category = await prisma.category.upsert({
  //     where: { slug: child.slug },
  //     update: {
  //       name: child.name,
  //       description: child.description,
  //       image: child.image,
  //       order: child.order,
  //       isActive: true,
  //       parentId: parent.id,
  //     },
  //     create: {
  //       name: child.name,
  //       slug: child.slug,
  //       description: child.description,
  //       image: child.image,
  //       order: child.order,
  //       isActive: true,
  //       parentId: parent.id,
  //     },
  //     select: {
  //       id: true,
  //       slug: true,
  //     },
  //   });

  //   childCategoryMap.set(category.slug, category);
  // }

  // console.log("✅ Categories ready");

  // let productCounter = 1;
  // let productCount = 0;

  // for (const template of productTemplates) {
  //   const category = childCategoryMap.get(template.categorySlug);

  //   if (!category) {
  //     throw new Error(`Child category not found: ${template.categorySlug}`);
  //   }

  //   for (const baseName of template.names) {
  //     const displayName = `YASH ${baseName}`;
  //     const slug = slugify(displayName);
  //     const imageUrl = productImages[productCounter % productImages.length];

  //     const product = await prisma.product.upsert({
  //       where: { slug },
  //       update: {
  //         name: displayName,
  //         description: template.description,
  //         ingredients: template.ingredients,
  //         benefits: template.benefits,
  //         usage: template.usage,
  //         categoryId: category.id,
  //         isActive: true,
  //         deletedAt: null,
  //       },
  //       create: {
  //         name: displayName,
  //         slug,
  //         description: template.description,
  //         ingredients: template.ingredients,
  //         benefits: template.benefits,
  //         usage: template.usage,
  //         categoryId: category.id,
  //         isActive: true,
  //       },
  //     });

  //     await ensureProductImage({
  //       productId: product.id,
  //       url: imageUrl,
  //       alt: displayName,
  //       isPrimary: true,
  //       sortOrder: 1,
  //     });

  //     await ensureProductImage({
  //       productId: product.id,
  //       url: productImages[(productCounter + 1) % productImages.length],
  //       alt: `${displayName} detail image`,
  //       isPrimary: false,
  //       sortOrder: 2,
  //     });

  //     for (const [variantIndex, variant] of template.variants.entries()) {
  //       await upsertVariant({
  //         productId: product.id,
  //         name: variant.name,
  //         mrp: variant.mrp + productCounter * 2 + variantIndex * 5,
  //         sellingPrice:
  //           variant.sellingPrice + productCounter * 2 + variantIndex * 5,
  //         stock: 20 + ((productCounter + variantIndex) % 60),
  //         lowStockLevel: 5,
  //         weight: variant.weight,
  //         unit: variant.unit,
  //       });
  //     }

  //     productCounter++;
  //     productCount++;
  //   }
  // }

  // if (productCount < 100) {
  //   throw new Error(`Production seed product count is too low: ${productCount}`);
  // }

  // const parentCategoryIds = Array.from(parentCategoryMap.values()).map(
  //   (category) => category.id
  // );

  // const productsInParentCategories = await prisma.product.count({
  //   where: {
  //     categoryId: {
  //       in: parentCategoryIds,
  //     },
  //   },
  // });

  // if (productsInParentCategories > 0) {
  //   throw new Error("Some products are assigned to parent categories");
  // }

  // console.log(`✅ Products ready: ${productCount}`);
  // console.log("✅ Verified: products assigned only to child categories");

  // for (const slide of heroSlides) {
  //   const existingSlide = await prisma.heroSlide.findFirst({
  //     where: {
  //       order: slide.order,
  //     },
  //   });

  //   if (existingSlide) {
  //     await prisma.heroSlide.update({
  //       where: { id: existingSlide.id },
  //       data: slide,
  //     });
  //   } else {
  //     await prisma.heroSlide.create({
  //       data: slide,
  //     });
  //   }
  // }

  // console.log("✅ Hero slides ready");
  console.log("🎉 Production seed completed successfully");
  console.log("--------------------------------------");
  console.log(`Admin Email: ${adminSeed.email}`);
  // console.log(`Products: ${productCount}`);
  // console.log("Customers/orders/carts: not seeded");
  // console.log("No existing customer/order data deleted");
  // console.log("--------------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Production seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
