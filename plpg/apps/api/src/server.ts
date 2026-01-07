import app from './app.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/v1/health`);
});
