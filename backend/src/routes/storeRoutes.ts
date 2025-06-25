import { Router } from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { prisma } from '../index'; // Assuming prisma is exported from index.ts

const router = Router();

// Configure multer for memory storage (to process CSV from buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

interface CsvRow {
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: string; // CSV data might be string, parse to Float
  longitude: string; // CSV data might be string, parse to Float
  products: string; // Expecting a comma-separated string of product names
}

router.post('/upload', upload.single('csvfile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results: CsvRow[] = [];
  const readableStream = Readable.from(req.file.buffer.toString());

  readableStream
    .pipe(csvParser())
    .on('data', (data: any) => {
      // Basic validation: ensure essential fields are present
      if (data.name && data.address && data.city && data.state && data.latitude && data.longitude && data.products) {
        results.push(data as CsvRow);
      } else {
        console.warn('Skipping incomplete row:', data);
      }
    })
    .on('end', async () => {
      if (results.length === 0) {
        return res.status(400).send('CSV file is empty, malformed, or contains no valid data rows.');
      }
      try {
        for (const row of results) {
          const lat = parseFloat(row.latitude);
          const lon = parseFloat(row.longitude);

          if (isNaN(lat) || isNaN(lon)) {
            console.warn(`Skipping row due to invalid latitude/longitude: ${row.name}`);
            continue;
          }

          // Upsert store (create if not exists, update if exists based on name and city for simplicity)
          // A more robust upsert might use a unique business ID if available
          const store = await prisma.store.upsert({
            where: {
              // This requires a unique constraint on name+city or a similar unique identifier.
              // For now, let's assume name is unique enough for this example or we add such a constraint.
              // To avoid errors if multiple stores have the same name, we'll find by name and city.
              // This is not a perfect unique identifier, but good for this example.
              // A true unique constraint in the DB on (name, city, state) would be better.
              // For now, we'll try to find an existing store by name, city, and state.
              // Prisma doesn't support upsert on non-unique fields directly.
              // So, we'll do a findFirst then update or create.
              name_city_state: { // This assumes we add a composite unique constraint in schema.prisma
                                // name_city_state: { name: row.name, city: row.city, state: row.state }
                                // If not, this specific upsert will fail.
                                // Let's adjust to a findFirst then update/create pattern for more flexibility without schema change yet.
                                name: row.name // Simplified: assuming store name is unique for now.
                                             // In a real app, more robust identification is needed.
                            }
            },
            update: {
              address: row.address,
              city: row.city,
              state: row.state,
              latitude: lat,
              longitude: lon,
            },
            create: {
              name: row.name,
              address: row.address,
              city: row.city,
              state: row.state,
              latitude: lat,
              longitude: lon,
            },
          });

          // Process products
          const productNames = row.products.split(',').map(name => name.trim()).filter(name => name.length > 0);
          for (const productName of productNames) {
            const product = await prisma.product.upsert({
              where: { name: productName },
              update: {},
              create: { name: productName },
            });

            // Link store and product
            await prisma.storeProduct.upsert({
              where: {
                storeId_productId: { // This refers to the @@unique([storeId, productId]) in schema.prisma
                  storeId: store.id,
                  productId: product.id,
                },
              },
              update: {}, // No fields to update on the link table itself if it exists
              create: {
                storeId: store.id,
                productId: product.id,
              },
            });
          }
        }
        res.status(201).send({ message: 'CSV data processed and stored successfully.', count: results.length });
      } catch (error) {
        console.error('Error processing CSV data:', error);
        // Check if error is a Prisma specific error for more detailed feedback
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
             res.status(409).send('Error processing CSV: A unique constraint violation occurred. This might be due to the store identification logic needing a unique constraint in your database (e.g., on store name, or name+city+state).');
        } else {
            res.status(500).send('Error processing CSV data.');
        }
      }
    })
    .on('error', (error: Error) => {
      console.error('Error reading CSV stream:', error);
      res.status(500).send('Error reading CSV file.');
    });
});

// GET /api/stores - Fetch stores based on filter criteria
router.get('/', async (req, res) => {
  const { state, city, productIds } = req.query; // productIds expected as comma-separated string of IDs

  try {
    const whereClause: any = {};

    if (state && typeof state === 'string') {
      whereClause.state = state;
    }
    if (city && typeof city === 'string') {
      whereClause.city = city;
    }

    if (productIds && typeof productIds === 'string' && productIds.length > 0) {
      const ids = productIds.split(',');
      if (ids.length > 0) {
        whereClause.products = {
          some: {
            productId: {
              in: ids,
            },
          },
        };
      }
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        products: { // Include the join table records
          include: {
            product: true, // Include the actual product details from the Product table
          },
        },
      },
      orderBy: [
        { state: 'asc' },
        { city: 'asc' },
        { name: 'asc' },
      ]
    });

    // Transform the result to make product details more accessible if needed,
    // or return as is if the frontend can handle the nested structure.
    // For now, returning as is. Frontend will get:
    // Store with a 'products' array, where each item is a StoreProduct record
    // that has a 'product' object nested within it.
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).send('Error fetching stores.');
  }
});

export default router;
