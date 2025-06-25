"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index"); // Assuming prisma is exported from index.ts
const router = (0, express_1.Router)();
// GET /api/filters/states - Get a distinct list of states
router.get('/states', async (req, res) => {
    try {
        const states = await index_1.prisma.store.findMany({
            select: {
                state: true,
            },
            distinct: ['state'],
            orderBy: {
                state: 'asc',
            },
        });
        res.json(states.map(s => s.state));
    }
    catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).send('Error fetching states.');
    }
});
// GET /api/filters/cities/:state - Get a distinct list of cities for a given state
router.get('/cities/:state', async (req, res) => {
    const { state } = req.params;
    try {
        const cities = await index_1.prisma.store.findMany({
            where: {
                state: state,
            },
            select: {
                city: true,
            },
            distinct: ['city'],
            orderBy: {
                city: 'asc',
            },
        });
        res.json(cities.map(c => c.city));
    }
    catch (error) {
        console.error(`Error fetching cities for state ${state}:`, error);
        res.status(500).send('Error fetching cities.');
    }
});
// GET /api/filters/products - Get a list of all available products
router.get('/products', async (req, res) => {
    try {
        const products = await index_1.prisma.product.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products.');
    }
});
exports.default = router;
//# sourceMappingURL=filterRoutes.js.map