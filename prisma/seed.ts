import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentStatus,
  TransactionType,
} from "../app/generated/prisma/client";
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

const productImages = [
  "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200",
  "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200",
  "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200",
  "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1200",
  "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1200",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200",
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200",
];

const productTemplates = [
  {
    categorySlug: "hair-oils",
    names: [
      "Herbal Hair Oil",
      "Amla Hair Oil",
      "Bhringraj Hair Oil",
      "Hibiscus Hair Oil",
      "Onion Hair Oil",
      "Coconut Hair Oil",
      "Neem Hair Oil",
      "Fenugreek Hair Oil",
      "Curry Leaf Hair Oil",
      "Aloe Hair Oil",
      "Rosemary Hair Oil",
      "Castor Hair Oil",
      "Jasmine Hair Oil",
      "Black Seed Hair Oil",
      "Tea Tree Hair Oil",
    ],
    description:
      "Natural herbal hair oil crafted to nourish the scalp, support healthy hair growth, and improve shine.",
    ingredients:
      "Coconut Oil, Amla, Bhringraj, Hibiscus, Fenugreek, Curry Leaves, Neem Extract.",
    benefits:
      "Helps nourish scalp, reduce dryness, support hair strength, improve shine, and promote healthy-looking hair.",
    usage:
      "Apply gently to scalp and hair. Massage for 5-10 minutes. Leave for at least 1 hour or overnight, then wash with mild shampoo.",
    variants: [
      { name: "100ml", mrp: 249, sellingPrice: 199, weight: 100, unit: "ml" },
      { name: "200ml", mrp: 449, sellingPrice: 349, weight: 200, unit: "ml" },
    ],
  },
  {
    categorySlug: "hair-powders",
    names: [
      "Amla Powder",
      "Hibiscus Powder",
      "Bhringraj Powder",
      "Shikakai Powder",
      "Reetha Powder",
      "Neem Hair Powder",
      "Fenugreek Hair Powder",
      "Curry Leaf Powder",
      "Herbal Hair Wash Powder",
      "Natural Hair Pack Powder",
    ],
    description:
      "Traditional herbal hair powder made with natural ingredients for gentle hair care.",
    ingredients:
      "Dried Herbal Extracts, Amla, Hibiscus, Bhringraj, Shikakai, Reetha, Neem.",
    benefits:
      "Supports scalp freshness, natural cleansing, hair softness, and healthy-looking hair.",
    usage:
      "Mix with water, curd, or aloe gel to form a paste. Apply to scalp and hair. Rinse after 20-30 minutes.",
    variants: [
      { name: "100g", mrp: 149, sellingPrice: 119, weight: 100, unit: "g" },
      { name: "250g", mrp: 299, sellingPrice: 249, weight: 250, unit: "g" },
    ],
  },
  {
    categorySlug: "face-care",
    names: [
      "Aloe Vera Skin Gel",
      "Rose Face Gel",
      "Neem Face Pack",
      "Sandalwood Face Pack",
      "Turmeric Face Pack",
      "Charcoal Face Pack",
      "Multani Mitti Face Pack",
      "Honey Face Gel",
      "Saffron Face Gel",
      "Green Tea Face Gel",
      "Vitamin E Face Cream",
      "Herbal Face Cream",
      "Natural Face Scrub",
      "Rose Water Toner",
      "Aloe Face Wash",
    ],
    description:
      "Gentle skincare product made with natural ingredients for daily freshness and glow.",
    ingredients:
      "Aloe Vera Extract, Rose Water, Neem, Turmeric, Sandalwood, Vitamin E, Natural Base.",
    benefits:
      "Helps hydrate skin, reduce dryness, refresh dull skin, and support a natural glow.",
    usage:
      "Apply on clean skin. Use daily or as directed. Avoid contact with eyes.",
    variants: [
      { name: "100g", mrp: 199, sellingPrice: 149, weight: 100, unit: "g" },
      { name: "250g", mrp: 399, sellingPrice: 299, weight: 250, unit: "g" },
    ],
  },
  {
    categorySlug: "body-care",
    names: [
      "Herbal Body Lotion",
      "Aloe Body Lotion",
      "Coconut Body Butter",
      "Shea Body Butter",
      "Rose Body Lotion",
      "Sandal Body Lotion",
      "Neem Body Wash",
      "Aloe Body Wash",
      "Natural Bath Powder",
      "Herbal Bath Powder",
    ],
    description:
      "Natural body care product designed for soft, fresh, and nourished skin.",
    ingredients:
      "Aloe Vera, Coconut Extract, Shea Butter, Rose Water, Neem Extract, Natural Oils.",
    benefits:
      "Helps moisturize skin, reduce dryness, refresh body, and support smooth skin texture.",
    usage:
      "Apply after bath or whenever needed. Massage gently until absorbed.",
    variants: [
      { name: "100ml", mrp: 199, sellingPrice: 159, weight: 100, unit: "ml" },
      { name: "250ml", mrp: 399, sellingPrice: 329, weight: 250, unit: "ml" },
    ],
  },
  {
    categorySlug: "dry-fruits",
    names: [
      "Premium Badam",
      "Premium Pista",
      "Cashew Nuts",
      "Walnuts",
      "Raisins",
      "Black Raisins",
      "Dates",
      "Dry Figs",
      "Apricots",
      "Mixed Dry Fruits",
      "Roasted Badam",
      "Salted Pista",
      "Raw Cashews",
      "Seedless Dates",
      "Premium Anjeer",
      "Trail Mix",
      "Almond Slices",
      "Pista Kernels",
      "Dry Fruit Combo",
      "Healthy Nut Mix",
    ],
    description:
      "Premium quality dry fruits packed with natural nutrition, freshness, and rich taste.",
    ingredients:
      "100% premium dry fruits. No artificial color or added preservatives.",
    benefits:
      "Rich in protein, fiber, healthy fats, vitamins, minerals, and natural energy.",
    usage:
      "Eat directly as a snack, soak overnight, or add to milk, sweets, smoothies, and desserts.",
    variants: [
      { name: "250g", mrp: 399, sellingPrice: 349, weight: 250, unit: "g" },
      { name: "500g", mrp: 749, sellingPrice: 649, weight: 500, unit: "g" },
      { name: "1kg", mrp: 1399, sellingPrice: 1199, weight: 1, unit: "kg" },
    ],
  },
  {
    categorySlug: "spices",
    names: [
      "Organic Turmeric Powder",
      "Red Chilli Powder",
      "Coriander Powder",
      "Black Pepper",
      "Cumin Seeds",
      "Fennel Seeds",
      "Mustard Seeds",
      "Cardamom",
      "Cloves",
      "Cinnamon",
      "Bay Leaf",
      "Garam Masala",
      "Sambar Powder",
      "Rasam Powder",
      "Chicken Masala",
      "Mutton Masala",
      "Biryani Masala",
      "Pepper Powder",
      "Jeera Powder",
      "Kitchen King Masala",
    ],
    description:
      "Aromatic Indian spice made for rich flavor, natural aroma, and traditional cooking.",
    ingredients:
      "Natural spice ingredients cleaned, dried, and packed hygienically.",
    benefits:
      "Adds taste, aroma, color, and traditional goodness to everyday cooking.",
    usage:
      "Use in curries, soups, rice dishes, gravies, and traditional recipes as required.",
    variants: [
      { name: "100g", mrp: 99, sellingPrice: 79, weight: 100, unit: "g" },
      { name: "250g", mrp: 199, sellingPrice: 159, weight: 250, unit: "g" },
      { name: "500g", mrp: 349, sellingPrice: 299, weight: 500, unit: "g" },
    ],
  },
  {
    categorySlug: "natural-sweeteners",
    names: [
      "Organic Jaggery Powder",
      "Palm Sugar",
      "Country Sugar",
      "Rock Candy",
      "Natural Honey",
      "Raw Honey",
      "Palm Jaggery",
      "Jaggery Cubes",
      "Date Syrup",
      "Herbal Honey",
    ],
    description:
      "Natural sweetener option for daily use, drinks, sweets, and traditional recipes.",
    ingredients:
      "Natural sweetener source packed hygienically without artificial color.",
    benefits:
      "Useful as a natural alternative for sweetening drinks, foods, and desserts.",
    usage:
      "Use in tea, coffee, milk, sweets, porridge, desserts, and homemade recipes.",
    variants: [
      { name: "250g", mrp: 199, sellingPrice: 149, weight: 250, unit: "g" },
      { name: "500g", mrp: 349, sellingPrice: 279, weight: 500, unit: "g" },
    ],
  },
  {
    categorySlug: "herbal-tea",
    names: [
      "Tulsi Herbal Tea",
      "Green Tea",
      "Hibiscus Tea",
      "Chamomile Tea",
      "Moringa Tea",
      "Lemongrass Tea",
      "Ginger Tea",
      "Masala Tea",
      "Detox Herbal Tea",
      "Rose Tea",
    ],
    description:
      "Refreshing herbal tea blend made with natural herbs for a soothing daily drink.",
    ingredients:
      "Natural tea leaves, herbs, spices, flowers, and herbal extracts.",
    benefits:
      "Helps refresh the body, support relaxation, and provide a soothing beverage experience.",
    usage:
      "Add to hot water. Steep for 3-5 minutes. Strain and serve warm.",
    variants: [
      { name: "50g", mrp: 149, sellingPrice: 119, weight: 50, unit: "g" },
      { name: "100g", mrp: 249, sellingPrice: 199, weight: 100, unit: "g" },
    ],
  },
  {
    categorySlug: "seeds",
    names: [
      "Chia Seeds",
      "Flax Seeds",
      "Pumpkin Seeds",
      "Sunflower Seeds",
      "Sesame Seeds",
      "Watermelon Seeds",
      "Basil Seeds",
      "Mixed Seeds",
      "Quinoa Seeds",
      "Healthy Seed Mix",
    ],
    description:
      "Nutritious seeds for daily wellness, smoothies, salads, and healthy snacking.",
    ingredients:
      "100% natural edible seeds packed hygienically.",
    benefits:
      "Good source of fiber, plant protein, healthy fats, minerals, and daily nutrition.",
    usage:
      "Add to smoothies, breakfast bowls, salads, curd, juices, or consume as recommended.",
    variants: [
      { name: "100g", mrp: 149, sellingPrice: 119, weight: 100, unit: "g" },
      { name: "250g", mrp: 299, sellingPrice: 249, weight: 250, unit: "g" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  console.log("🧹 Cleaning old data...");

  await prisma.stockTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@yashorganics.com",
      phone: "9999999999",
      password: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Arun Kumar",
      email: "arun@example.com",
      phone: "9876543210",
      password: customerPassword,
      role: Role.CUSTOMER,
      isVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "9876543211",
      password: customerPassword,
      role: Role.CUSTOMER,
      isVerified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: "Karthik Raj",
      email: "karthik@example.com",
      phone: "9876543212",
      password: customerPassword,
      role: Role.CUSTOMER,
      isVerified: true,
    },
  });

  console.log("✅ Users created");

  const address1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: "Arun Kumar",
      phone: "9876543210",
      email: "arun@example.com",
      addressLine1: "12, Anna Nagar Main Road",
      addressLine2: "Near Bus Stand",
      city: "Madurai",
      state: "Tamil Nadu",
      postalCode: "625020",
      country: "India",
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      fullName: "Priya Sharma",
      phone: "9876543211",
      email: "priya@example.com",
      addressLine1: "45, Gandhi Street",
      addressLine2: "Opposite Temple",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600001",
      country: "India",
      isDefault: true,
    },
  });

  const address3 = await prisma.address.create({
    data: {
      userId: customer3.id,
      fullName: "Karthik Raj",
      phone: "9876543212",
      email: "karthik@example.com",
      addressLine1: "88, Lake View Road",
      addressLine2: "Near Park",
      city: "Coimbatore",
      state: "Tamil Nadu",
      postalCode: "641001",
      country: "India",
      isDefault: true,
    },
  });

  console.log("✅ Addresses created");

  // =========================
  // PARENT CATEGORIES
  // Products will NOT be assigned to these parent categories.
  // =========================
  const hairCare = await prisma.category.create({
    data: {
      name: "Hair Care",
      slug: "hair-care",
      description:
        "Natural herbal hair care products for strong, healthy, and nourished hair.",
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200",
      order: 1,
      isActive: true,
    },
  });

  const skinCare = await prisma.category.create({
    data: {
      name: "Skin Care",
      slug: "skin-care",
      description:
        "Gentle herbal skincare products made with natural ingredients.",
      image:
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
      order: 2,
      isActive: true,
    },
  });

  const naturalEssentials = await prisma.category.create({
    data: {
      name: "Natural Essentials",
      slug: "natural-essentials",
      description:
        "Premium dry fruits, spices, seeds, tea, and daily natural wellness essentials.",
      image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200",
      order: 3,
      isActive: true,
    },
  });

  // =========================
  // CHILD CATEGORIES
  // Products are assigned only to these categories.
  // =========================
  const childCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Hair Oils",
        slug: "hair-oils",
        description:
          "Herbal oils for scalp nourishment, shine, and healthy-looking hair.",
        image:
          "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200",
        order: 1,
        isActive: true,
        parentId: hairCare.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Hair Powders",
        slug: "hair-powders",
        description:
          "Traditional herbal powders for natural hair care routines.",
        image:
          "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200",
        order: 2,
        isActive: true,
        parentId: hairCare.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Face Care",
        slug: "face-care",
        description:
          "Natural gels, packs, creams, toners, and scrubs for daily skincare.",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
        order: 1,
        isActive: true,
        parentId: skinCare.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Body Care",
        slug: "body-care",
        description:
          "Natural body lotions, butters, bath powders, and body wash products.",
        image:
          "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200",
        order: 2,
        isActive: true,
        parentId: skinCare.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Dry Fruits",
        slug: "dry-fruits",
        description:
          "Premium dry fruits packed with freshness, taste, and nutrition.",
        image:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200",
        order: 1,
        isActive: true,
        parentId: naturalEssentials.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Spices",
        slug: "spices",
        description:
          "Aromatic Indian spices for taste, health, and traditional cooking.",
        image:
          "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200",
        order: 2,
        isActive: true,
        parentId: naturalEssentials.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Natural Sweeteners",
        slug: "natural-sweeteners",
        description:
          "Natural sweeteners like jaggery, palm sugar, honey, and country sugar.",
        image:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200",
        order: 3,
        isActive: true,
        parentId: naturalEssentials.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Herbal Tea",
        slug: "herbal-tea",
        description:
          "Refreshing herbal teas made with natural herbs, flowers, and spices.",
        image:
          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200",
        order: 4,
        isActive: true,
        parentId: naturalEssentials.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Seeds",
        slug: "seeds",
        description:
          "Nutritious seeds for smoothies, salads, breakfast, and daily wellness.",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
        order: 5,
        isActive: true,
        parentId: naturalEssentials.id,
      },
    }),
  ]);

  const childCategoryMap = new Map(
    childCategories.map((category) => [category.slug, category])
  );

  console.log("✅ Parent and child categories created");

  // =========================
  // 120 PRODUCTS
  // Important:
  // categoryId always comes from childCategoryMap.
  // No product is assigned to parent category.
  // =========================
  const createdProducts = [];

  let productCounter = 1;

  for (const template of productTemplates) {
    const category = childCategoryMap.get(template.categorySlug);

    if (!category) {
      throw new Error(`Child category not found: ${template.categorySlug}`);
    }

    for (const baseName of template.names) {
      const displayName = `YASH ${baseName}`;
      const slug = slugify(displayName);
      const imageUrl = productImages[productCounter % productImages.length];

      const product = await prisma.product.create({
        data: {
          name: displayName,
          slug,
          description: template.description,
          ingredients: template.ingredients,
          benefits: template.benefits,
          usage: template.usage,
          categoryId: category.id,
          isActive: true,
          productImages: {
            create: [
              {
                url: imageUrl,
                alt: displayName,
                isPrimary: true,
                sortOrder: 1,
              },
              {
                url: productImages[(productCounter + 1) % productImages.length],
                alt: `${displayName} detail image`,
                isPrimary: false,
                sortOrder: 2,
              },
            ],
          },
          variants: {
            create: template.variants.map((variant, variantIndex) => ({
              name: variant.name,
              mrp: variant.mrp + productCounter * 2 + variantIndex * 5,
              sellingPrice:
                variant.sellingPrice + productCounter * 2 + variantIndex * 5,
              stock: 20 + ((productCounter + variantIndex) % 60),
              lowStockLevel: 5,
              weight: variant.weight,
              unit: variant.unit,
              isActive: true,
            })),
          },
        },
        include: {
          variants: true,
          productImages: true,
          category: true,
        },
      });

      createdProducts.push(product);
      productCounter++;
    }
  }

  console.log(`✅ Products created: ${createdProducts.length}`);

  if (createdProducts.length < 100) {
    throw new Error("Product count is less than 100");
  }

  // Safety check: make sure no product is assigned to parent category.
  const parentCategoryIds = [hairCare.id, skinCare.id, naturalEssentials.id];

  const wronglyAssignedProducts = createdProducts.filter((product) =>
    parentCategoryIds.includes(product.categoryId)
  );

  if (wronglyAssignedProducts.length > 0) {
    throw new Error("Some products are assigned to parent categories");
  }

  console.log("✅ Verified: Products assigned only to child categories");

  // =========================
  // STOCK TRANSACTIONS
  // =========================
  for (const product of createdProducts) {
    for (const variant of product.variants) {
      await prisma.stockTransaction.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          quantity: variant.stock,
          type: TransactionType.RESTOCK,
          reason: "Initial seed stock",
        },
      });
    }
  }

  console.log("✅ Stock transactions created");

  // =========================
  // CARTS
  // =========================
  const cartProduct1 = createdProducts[0];
  const cartProduct2 = createdProducts[20];
  const cartProduct3 = createdProducts[45];
  const cartProduct4 = createdProducts[70];

  await prisma.cart.create({
    data: {
      userId: customer1.id,
      cartItems: {
        create: [
          {
            productId: cartProduct1.id,
            variantId: cartProduct1.variants[0].id,
            quantity: 2,
            sellingPrice: cartProduct1.variants[0].sellingPrice,
          },
          {
            productId: cartProduct2.id,
            variantId: cartProduct2.variants[0].id,
            quantity: 1,
            sellingPrice: cartProduct2.variants[0].sellingPrice,
          },
        ],
      },
    },
  });

  await prisma.cart.create({
    data: {
      userId: customer2.id,
      cartItems: {
        create: [
          {
            productId: cartProduct3.id,
            variantId: cartProduct3.variants[0].id,
            quantity: 1,
            sellingPrice: cartProduct3.variants[0].sellingPrice,
          },
          {
            productId: cartProduct4.id,
            variantId: cartProduct4.variants[0].id,
            quantity: 2,
            sellingPrice: cartProduct4.variants[0].sellingPrice,
          },
        ],
      },
    },
  });

  console.log("✅ Carts created");

  // =========================
  // ORDERS
  // =========================
  const orderProduct1 = createdProducts[5];
  const orderProduct2 = createdProducts[35];
  const orderProduct3 = createdProducts[60];
  const orderProduct4 = createdProducts[90];

  const order1Subtotal =
    orderProduct1.variants[0].sellingPrice * 2 +
    orderProduct2.variants[0].sellingPrice * 1;

  await prisma.order.create({
    data: {
      userId: customer1.id,
      addressId: address1.id,
      orderStatus: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      totalAmount: order1Subtotal + 50,
      deliveryCharge: 50,
      razorpayOrderId: "order_seed_paid_001",
      razorpayPaymentId: "pay_seed_001",
      razorpaySignature: "seed_signature_001",
      courierPartner: "Delhivery",
      trackingId: "DLV-SEED-001",
      shippingName: address1.fullName,
      shippingPhone: address1.phone,
      shippingEmail: address1.email,
      shippingAddress: `${address1.addressLine1}, ${address1.addressLine2}, ${address1.city}, ${address1.state} - ${address1.postalCode}, ${address1.country}`,
      orderItems: {
        create: [
          {
            productId: orderProduct1.id,
            variantId: orderProduct1.variants[0].id,
            productName: orderProduct1.name,
            variantName: orderProduct1.variants[0].name,
            productImage: orderProduct1.productImages[0]?.url,
            quantity: 2,
            sellingPrice: orderProduct1.variants[0].sellingPrice,
          },
          {
            productId: orderProduct2.id,
            variantId: orderProduct2.variants[0].id,
            productName: orderProduct2.name,
            variantName: orderProduct2.variants[0].name,
            productImage: orderProduct2.productImages[0]?.url,
            quantity: 1,
            sellingPrice: orderProduct2.variants[0].sellingPrice,
          },
        ],
      },
    },
  });

  const order2Subtotal =
    orderProduct3.variants[0].sellingPrice * 1 +
    orderProduct4.variants[0].sellingPrice * 2;

  await prisma.order.create({
    data: {
      userId: customer2.id,
      addressId: address2.id,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: order2Subtotal + 50,
      deliveryCharge: 50,
      razorpayOrderId: "order_seed_pending_001",
      courierPartner: null,
      trackingId: null,
      shippingName: address2.fullName,
      shippingPhone: address2.phone,
      shippingEmail: address2.email,
      shippingAddress: `${address2.addressLine1}, ${address2.addressLine2}, ${address2.city}, ${address2.state} - ${address2.postalCode}, ${address2.country}`,
      orderItems: {
        create: [
          {
            productId: orderProduct3.id,
            variantId: orderProduct3.variants[0].id,
            productName: orderProduct3.name,
            variantName: orderProduct3.variants[0].name,
            productImage: orderProduct3.productImages[0]?.url,
            quantity: 1,
            sellingPrice: orderProduct3.variants[0].sellingPrice,
          },
          {
            productId: orderProduct4.id,
            variantId: orderProduct4.variants[0].id,
            productName: orderProduct4.name,
            variantName: orderProduct4.variants[0].name,
            productImage: orderProduct4.productImages[0]?.url,
            quantity: 2,
            sellingPrice: orderProduct4.variants[0].sellingPrice,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: customer3.id,
      addressId: address3.id,
      orderStatus: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      totalAmount: createdProducts[15].variants[0].sellingPrice + 50,
      deliveryCharge: 50,
      razorpayOrderId: "order_seed_processing_001",
      razorpayPaymentId: "pay_seed_003",
      razorpaySignature: "seed_signature_003",
      courierPartner: "Blue Dart",
      trackingId: "BD-SEED-003",
      shippingName: address3.fullName,
      shippingPhone: address3.phone,
      shippingEmail: address3.email,
      shippingAddress: `${address3.addressLine1}, ${address3.addressLine2}, ${address3.city}, ${address3.state} - ${address3.postalCode}, ${address3.country}`,
      orderItems: {
        create: [
          {
            productId: createdProducts[15].id,
            variantId: createdProducts[15].variants[0].id,
            productName: createdProducts[15].name,
            variantName: createdProducts[15].variants[0].name,
            productImage: createdProducts[15].productImages[0]?.url,
            quantity: 1,
            sellingPrice: createdProducts[15].variants[0].sellingPrice,
          },
        ],
      },
    },
  });

  console.log("✅ Orders created");

  // =========================
  // HERO SLIDES
  // =========================
  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Pure Herbal Care for Everyday Wellness",
        subtitle: "Natural Hair & Skin Care",
        description:
          "Discover premium herbal products crafted with natural ingredients for healthy hair, glowing skin, and daily wellness.",
        image:
          "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1600",
        link: "/products",
        ctaText: "Shop Now",
        order: 1,
        isActive: true,
      },
      {
        title: "Premium Dry Fruits & Natural Essentials",
        subtitle: "Fresh. Healthy. Natural.",
        description:
          "Shop high-quality badam, pista, spices, seeds, and natural essentials for your home.",
        image:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1600",
        link: "/category/natural-essentials",
        ctaText: "Explore Products",
        order: 2,
        isActive: true,
      },
      {
        title: "Traditional Goodness in Every Product",
        subtitle: "YASH Organics",
        description:
          "Made for customers who prefer pure, trusted, and natural products.",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600",
        link: "/about",
        ctaText: "Know More",
        order: 3,
        isActive: true,
      },
    ],
  });

  console.log("✅ Hero slides created");

  console.log("🎉 Seeding completed successfully!");
  console.log("--------------------------------------");
  console.log("Admin Login:");
  console.log("Email: admin@yashorganics.com");
  console.log("Password: admin123");
  console.log("--------------------------------------");
  console.log("Customer Login:");
  console.log("Email: arun@example.com");
  console.log("Password: customer123");
  console.log("--------------------------------------");
  console.log(`Total products: ${createdProducts.length}`);
  console.log("Products assigned only to child categories: YES");
  console.log("--------------------------------------");
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