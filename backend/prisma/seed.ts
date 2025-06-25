import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleStoresData = [
  // Massachusetts stores
  { name: 'Our Market', address: '1 East Chop Drive', city: 'Vineyard Haven', state: 'MA', latitude: 41.4558, longitude: -70.6033 },
  { name: 'Norton Wine & Spirits', address: '3 West Main Street', city: 'Norton', state: 'MA', latitude: 41.9667, longitude: -71.1833 },
  { name: 'Table & Vine', address: '1119 West Street', city: 'Hadley', state: 'MA', latitude: 42.3495, longitude: -72.5712 },
  { name: 'Tin Can', address: '3 Wilson Street', city: 'Reading', state: 'MA', latitude: 42.5259, longitude: -71.0951 },
  
  // New York stores
  { name: 'Albany Wine Shop', address: '123 State Street', city: 'Albany', state: 'NY', latitude: 42.6526, longitude: -73.7562 },
  { name: 'Buffalo Spirits', address: '456 Main Street', city: 'Buffalo', state: 'NY', latitude: 42.8864, longitude: -78.8784 },
  { name: 'Rochester Wine & Liquor', address: '789 East Avenue', city: 'Rochester', state: 'NY', latitude: 43.1566, longitude: -77.6088 },
  { name: 'Syracuse Wine Store', address: '321 Erie Boulevard', city: 'Syracuse', state: 'NY', latitude: 43.0481, longitude: -76.1474 },
  
  // Connecticut stores
  { name: 'Hartford Fine Wines', address: '100 Asylum Street', city: 'Hartford', state: 'CT', latitude: 41.7658, longitude: -72.6734 },
  { name: 'New Haven Liquors', address: '200 Chapel Street', city: 'New Haven', state: 'CT', latitude: 41.3083, longitude: -72.9279 },
  { name: 'Stamford Wine Co', address: '300 Bedford Street', city: 'Stamford', state: 'CT', latitude: 41.0534, longitude: -73.5387 },
  
  // New Hampshire stores
  { name: 'Concord Wine & Spirits', address: '50 Main Street', city: 'Concord', state: 'NH', latitude: 43.2081, longitude: -71.5376 },
  { name: 'Manchester Liquor Store', address: '75 Elm Street', city: 'Manchester', state: 'NH', latitude: 42.9956, longitude: -71.4548 },
  
  // Vermont stores
  { name: 'Burlington Wine Shop', address: '25 Church Street', city: 'Burlington', state: 'VT', latitude: 44.4759, longitude: -73.2121 },
  { name: 'Montpelier Spirits', address: '10 State Street', city: 'Montpelier', state: 'VT', latitude: 44.2601, longitude: -72.5806 },
  
  // Rhode Island stores
  { name: 'Providence Wine & Spirits', address: '150 Westminster Street', city: 'Providence', state: 'RI', latitude: 41.8240, longitude: -71.4128 },
  { name: 'Newport Fine Wines', address: '75 Thames Street', city: 'Newport', state: 'RI', latitude: 41.4901, longitude: -71.3128 },
  
  // California stores
  { name: 'San Francisco Wine Co', address: '500 Market Street', city: 'San Francisco', state: 'CA', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Los Angeles Spirits', address: '100 Hollywood Blvd', city: 'Los Angeles', state: 'CA', latitude: 34.0522, longitude: -118.2437 },
  { name: 'San Diego Wine Store', address: '200 Harbor Drive', city: 'San Diego', state: 'CA', latitude: 32.7157, longitude: -117.1611 },
  
  // Texas stores
  { name: 'Austin Wine & Spirits', address: '300 Congress Ave', city: 'Austin', state: 'TX', latitude: 30.2672, longitude: -97.7431 },
  { name: 'Houston Liquor Store', address: '400 Main Street', city: 'Houston', state: 'TX', latitude: 29.7604, longitude: -95.3698 },
  { name: 'Dallas Fine Wines', address: '500 Elm Street', city: 'Dallas', state: 'TX', latitude: 32.7767, longitude: -96.7970 },
  
  // Florida stores
  { name: 'Miami Wine Shop', address: '600 Ocean Drive', city: 'Miami', state: 'FL', latitude: 25.7617, longitude: -80.1918 },
  { name: 'Tampa Spirits', address: '700 Kennedy Blvd', city: 'Tampa', state: 'FL', latitude: 27.9506, longitude: -82.4572 },
  { name: 'Orlando Wine Store', address: '800 Orange Ave', city: 'Orlando', state: 'FL', latitude: 28.5383, longitude: -81.3792 },
  
  // Illinois stores
  { name: 'Chicago Wine Co', address: '900 Michigan Ave', city: 'Chicago', state: 'IL', latitude: 41.8781, longitude: -87.6298 },
  { name: 'Springfield Liquors', address: '1000 Capitol Ave', city: 'Springfield', state: 'IL', latitude: 39.7817, longitude: -89.6501 },
  
  // Washington stores
  { name: 'Seattle Wine & Spirits', address: '1100 Pike Street', city: 'Seattle', state: 'WA', latitude: 47.6062, longitude: -122.3321 },
  { name: 'Spokane Fine Wines', address: '1200 Riverside Ave', city: 'Spokane', state: 'WA', latitude: 47.6587, longitude: -117.4260 },
  
  // Oregon stores
  { name: 'Portland Wine Shop', address: '1300 Burnside Street', city: 'Portland', state: 'OR', latitude: 45.5152, longitude: -122.6784 },
  { name: 'Eugene Spirits', address: '1400 Willamette Street', city: 'Eugene', state: 'OR', latitude: 44.0521, longitude: -123.0868 },
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