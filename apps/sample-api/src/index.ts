import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'sample-api',
  });
});

// Demo API endpoint
app.get('/api/demo', (_req: Request, res: Response) => {
  res.json({
    message: 'Hello from Sample API in SpecKit Monorepo!',
    features: [
      'Shared TypeScript configuration',
      'Shared ESLint configuration',
      'Turbo build system integration',
      'pnpm workspace management',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sample API server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Demo API: http://localhost:${PORT}/api/demo`);
});