import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StoreData {
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

const sampleStoresData: StoreData[] = [
  {
    name: 'Downtown Liquor Store',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    name: 'West Side Wine & Spirits',
    address: '456 Broadway',
    city: 'New York',
    state: 'NY',
    latitude: 40.7589,
    longitude: -73.9851
  },
  {
    name: 'California Spirits',
    address: '789 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    name: 'Texas Liquor Mart',
    address: '321 Austin Ave',
    city: 'Austin',
    state: 'TX',
    latitude: 30.2672,
    longitude: -97.7431
  },
  {
    name: 'Florida Keys Spirits',
    address: '654 Ocean Dr',
    city: 'Miami',
    state: 'FL',
    latitude: 25.7617,
    longitude: -80.1918
  }
];

const sampleProducts = [
  { name: 'VTiQuila' },
  { name: 'Woodland Gin' },
  { name: 'Maple Cask Bourbon' },
  { name: 'Vodka' },
  { name: 'Mountain Water Lemon Lime Honey (Agave Spirit)' },
  { name: 'Whiskey' },
  { name: 'Rum' },
  { name: 'Tequila' },
  { name: 'Brandy' },
  { name: 'Liqueur' },
];

async function main() {
  console.log('Start seeding...');
  
  // Clean existing data
  await prisma.storeProduct.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.product.deleteMany({});
  
  // Create products
  console.log('Creating products...');
  const createdProducts: any[] = [];
  for (const product of sampleProducts) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    createdProducts.push(createdProduct);
  }
  
  // Create stores
  console.log('Creating stores...');
  const createdStores: any[] = [];
  for (const store of sampleStoresData) {
    const createdStore = await prisma.store.create({
      data: store,
    });
    createdStores.push(createdStore);
  }
  
  // Create store-product relationships (randomly assign products to stores)
  console.log('Creating store-product relationships...');
  for (const store of createdStores) {
    // Randomly assign 2-5 products to each store
    const numProducts = Math.floor(Math.random() * 4) + 2; // 2-5 products
    const shuffledProducts = [...createdProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, numProducts);
    
    for (const product of selectedProducts) {
      await prisma.storeProduct.create({
        data: {
          storeId: store.id,
          productId: product.id,
        },
      });
    }
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  }); 