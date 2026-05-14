
const { PrismaClient } = require('../app/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany();
  console.log('Variants:', JSON.stringify(variants, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
