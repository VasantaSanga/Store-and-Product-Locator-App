"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.Environments = void 0;
const dotenv_1 = require("dotenv");
// load env config
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
exports.Environments = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production'
};
// Configuration object
const configs = {
    NODE_ENV: process.env.NODE_ENV ?? exports.Environments.DEVELOPMENT,
    PORT: parseInt(process.env.PORT || '3001', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    DATABASE_URL: process.env.DATABASE_URL || ''
};
const app = (0, express_1.default)();
// Initialize Prisma Client AFTER dotenv is loaded
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Middleware
app.use((0, cors_1.default)({
    origin: configs.CORS_ORIGIN, // Use config instead of hardcoded value
    credentials: true
}));
app.use(express_1.default.json()); // Parses incoming requests with JSON payloads
// Basic Error Handling Middleware (example)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Default route
app.get('/', (req, res) => {
    res.send('Store Locator Backend is running!');
});
// Import routes
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const filterRoutes_1 = __importDefault(require("./routes/filterRoutes"));
// Use routes
app.use('/api/stores', storeRoutes_1.default); // All routes in storeRoutes will be prefixed with /api/stores
app.use('/api/filters', filterRoutes_1.default); // All routes in filterRoutes will be prefixed with /api/filters
// Graceful shutdown for Prisma Client
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
// Start server
app.listen(configs.PORT, () => {
    console.log(`Server is running on http://localhost:${configs.PORT}`);
});
//# sourceMappingURL=index.js.map