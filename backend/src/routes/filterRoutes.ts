import { Router, Request, Response } from 'express';
import { prisma } from '../index'; // Assuming prisma is exported from index.ts

const router = Router();

// GET /api/filters/states - Get a distinct list of states
router.get('/states', async (req: Request, res: Response) => {
  try {
    const states = await prisma.store.findMany({
      select: {
        state: true,
      },
      distinct: ['state'],
      orderBy: {
        state: 'asc',
      },
    });
    res.json(states.map(s => s.state));
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).send('Error fetching states.');
  }
});

// GET /api/filters/cities/:state - Get a distinct list of cities for a given state
router.get('/cities/:state', async (req: Request, res: Response) => {
  const { state } = req.params;
  try {
    const cities = await prisma.store.findMany({
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
  } catch (error) {
    console.error(`Error fetching cities for state ${state}:`, error);
    res.status(500).send('Error fetching cities.');
  }
});

// GET /api/filters/products - Get a list of all available products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products.');
  }
});

export default router;
