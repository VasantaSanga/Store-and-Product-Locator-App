# Store Locator Backend

## Environment Configuration

This backend uses a centralized configuration system for managing environment variables.

### Configuration Files

- `src/config/index.ts` - Main configuration object
- `src/config/env.ts` - Environment variable utilities
- `.env` - Environment variables (not tracked in git)

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Application Environment
NODE_ENV=development

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/store_locator_dev?schema=public
```

### Configuration Usage

Import the config object in your files:

```typescript
import config from './config';

// Use configuration values
console.log(`Server running on port ${config.PORT}`);
console.log(`Environment: ${config.NODE_ENV}`);

// Check environment
if (config.IS_DEVELOPMENT) {
  console.log('Running in development mode');
}
```

### Environment Variable Utilities

Use the utility functions for type-safe environment variable access:

```typescript
import { getEnvVar, getEnvVarAsNumber, getEnvVarAsBoolean } from './config/env';

// Get string environment variable
const apiKey = getEnvVar('API_KEY');

// Get number with default
const maxConnections = getEnvVarAsNumber('MAX_CONNECTIONS', 10);

// Get boolean
const enableLogging = getEnvVarAsBoolean('ENABLE_LOGGING', false);
```

### Configuration Validation

The configuration system automatically validates required environment variables on startup:

- ✅ Shows successful configuration load
- ❌ Exits with error if required variables are missing
- 💡 Provides helpful error messages

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your values

3. Start the development server:
   ```bash
   npm run dev
   ```

The server will validate your configuration and show any missing variables. 