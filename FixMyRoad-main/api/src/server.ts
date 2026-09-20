import { app } from './app';
import { ENV } from './config/env';
import { startSlaWorkers } from './workers/sla-sweeper.cron';

const server = app.listen(ENV.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 RoadWatch National Civic API Running on Port ${ENV.PORT}`);
  console.log(`🏛️ Environment: ${ENV.NODE_ENV}`);
  console.log(`🌐 Base URL: http://localhost:${ENV.PORT}`);
  console.log(`=======================================================`);

  // Start SLA workers
  startSlaWorkers();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
