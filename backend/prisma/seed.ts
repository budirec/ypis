import { PrismaClient, ItemType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://root:password@tempeh_postgres:5432/tempeh_erp' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const items = [
    { sku: 'TMP-001', name: 'Tempeh', type: ItemType.FINISHED_GOOD, unit: 'packs', quantity: 0 },
    { sku: 'SOY-001', name: 'Soybeans', type: ItemType.RAW_MATERIAL, unit: 'kg', quantity: 0 },
    { sku: 'RIC-001', name: 'Rice Flour', type: ItemType.RAW_MATERIAL, unit: 'kg', quantity: 0 },
    { sku: 'YST-001', name: 'Yeast', type: ItemType.RAW_MATERIAL, unit: 'g', quantity: 0 },
  ];

  for (const item of items) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
