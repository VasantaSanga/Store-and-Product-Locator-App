"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const index_1 = require("../index"); // Assuming prisma is exported from index.ts
const router = (0, express_1.Router)();
// Configure multer for memory storage (to process CSV from buffer)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post('/upload', upload.single('csvfile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const results = [];
    const readableStream = stream_1.Readable.from(req.file.buffer.toString());
    readableStream
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => {
        // Map the CSV columns to our expected format
        const normalizedRow = {};
        // Map column names (case-insensitive and flexible)
        const keys = Object.keys(data);
        keys.forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            // Handle store name variations
            if (lowerKey === 'store name' || lowerKey === 'storename' || lowerKey === 'name') {
                normalizedRow.name = data[key];
            }
            // Handle address
            else if (lowerKey === 'address') {
                normalizedRow.address = data[key];
            }
            // Handle city/town variations
            else if (lowerKey === 'town' || lowerKey === 'city') {
                normalizedRow.city = data[key];
            }
            // Handle state
            else if (lowerKey === 'state') {
                normalizedRow.state = data[key];
            }
            // Handle store number
            else if (lowerKey === 'store #' || lowerKey === 'store' || lowerKey === 'store number') {
                normalizedRow.storeNumber = data[key];
            }
        });
        // Basic validation: ensure essential fields are present
        // Skip rows with empty or missing store names
        if (normalizedRow.name && normalizedRow.name.trim() &&
            normalizedRow.address && normalizedRow.address.trim() &&
            normalizedRow.city && normalizedRow.city.trim() &&
            normalizedRow.state && normalizedRow.state.trim()) {
            // Add the raw data for product processing
            normalizedRow.rawData = data;
            results.push(normalizedRow);
        }
        else {
            console.warn('Skipping incomplete row - missing required fields:', {
                name: normalizedRow.name,
                address: normalizedRow.address,
                city: normalizedRow.city,
                state: normalizedRow.state,
                availableKeys: Object.keys(data)
            });
        }
    })
        .on('end', async () => {
        if (results.length === 0) {
            return res.status(400).send('CSV file is empty, malformed, or contains no valid data rows.');
        }
        try {
            for (const row of results) {
                // Generate realistic coordinates based on city and state
                // This is a temporary solution - ideally you'd use a geocoding service
                let lat = 0;
                let lon = 0;
                // Generate coordinates based on state (rough approximations)
                const stateCoords = {
                    'CA': { lat: 36.7783, lon: -119.4179 },
                    'TX': { lat: 31.9686, lon: -99.9018 },
                    'FL': { lat: 27.7663, lon: -81.6868 },
                    'NY': { lat: 40.7589, lon: -73.9851 },
                    'IL': { lat: 40.6331, lon: -89.3985 },
                    'PA': { lat: 41.2033, lon: -77.1945 },
                    'OH': { lat: 40.3888, lon: -82.7649 },
                    'GA': { lat: 33.7490, lon: -84.3880 },
                    'NC': { lat: 35.7596, lon: -79.0193 },
                    'MI': { lat: 43.3266, lon: -84.5361 },
                    'VT': { lat: 44.2601, lon: -72.5806 },
                    'NH': { lat: 43.1939, lon: -71.5724 },
                    'MA': { lat: 42.2081, lon: -71.0275 },
                    'RI': { lat: 41.6809, lon: -71.5118 }
                };
                if (stateCoords[row.state]) {
                    // Add some randomness to spread stores around the state
                    const baseCoords = stateCoords[row.state];
                    lat = baseCoords.lat + (Math.random() - 0.5) * 2; // ±1 degree variation
                    lon = baseCoords.lon + (Math.random() - 0.5) * 2; // ±1 degree variation
                }
                else {
                    // Fallback for unknown states - center of US with variation
                    lat = 39.8283 + (Math.random() - 0.5) * 10;
                    lon = -98.5795 + (Math.random() - 0.5) * 20;
                }
                // Upsert store using the composite unique constraint (name, city, state)
                const store = await index_1.prisma.store.upsert({
                    where: {
                        name_city_state: {
                            name: row.name,
                            city: row.city,
                            state: row.state
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
                // Process products - look for Yes/No columns for product availability
                const rawData = row.rawData;
                const productColumns = [
                    'VTQuila',
                    'Woodland Gin',
                    'Maple Cask Bourbon',
                    'Vodka',
                    'Mountain Water Lemon Lime Honey (Agave Spirit)'
                ];
                for (const productName of productColumns) {
                    // Check if this product is available at this store (looking for "Yes")
                    const isAvailable = rawData[productName] && rawData[productName].toLowerCase().trim() === 'yes';
                    if (isAvailable) {
                        const product = await index_1.prisma.product.upsert({
                            where: { name: productName },
                            update: {},
                            create: { name: productName },
                        });
                        // Link store and product
                        await index_1.prisma.storeProduct.upsert({
                            where: {
                                storeId_productId: {
                                    storeId: store.id,
                                    productId: product.id,
                                },
                            },
                            update: {},
                            create: {
                                storeId: store.id,
                                productId: product.id,
                            },
                        });
                    }
                }
            }
            res.status(201).send({ message: 'CSV data processed and stored successfully.', count: results.length });
        }
        catch (error) {
            console.error('Error processing CSV data:', error);
            // Check if error is a Prisma specific error for more detailed feedback
            if (error instanceof Error && 'code' in error && error.code === 'P2002') {
                res.status(409).send({ message: 'Error processing CSV: A unique constraint violation occurred. This might be due to duplicate store data in the CSV.', error: error.message });
            }
            else {
                res.status(500).send({ message: 'Error processing CSV data.', error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }
    })
        .on('error', (error) => {
        console.error('Error reading CSV stream:', error);
        res.status(500).send('Error reading CSV file.');
    });
});
// GET /api/stores - Fetch stores based on filter criteria
router.get('/', async (req, res) => {
    const { state, city, productIds } = req.query; // productIds expected as comma-separated string of IDs
    try {
        const whereClause = {};
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
        const stores = await index_1.prisma.store.findMany({
            where: whereClause,
            include: {
                products: {
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
    }
    catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).send('Error fetching stores.');
    }
});
exports.default = router;
//# sourceMappingURL=storeRoutes.js.map