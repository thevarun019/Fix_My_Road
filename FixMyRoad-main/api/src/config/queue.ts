import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { ENV } from './env';
import EventEmitter from 'events';

export const localEventBus = new EventEmitter();

let redisConnection: Redis | null = null;
let slaQueue: Queue | null = null;
let isRedisAvailable = false;

try {
  redisConnection = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null // don't loop endlessly if redis not running locally
  });

  redisConnection.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Redis] Connected successfully.');
  });

  redisConnection.on('error', (err) => {
    isRedisAvailable = false;
    // gracefully fallback to local in-memory event bus
  });

  slaQueue = new Queue('sla-queue', { connection: redisConnection });
} catch (e) {
  isRedisAvailable = false;
}

export async function addSlaJob(name: string, data: any, delayMs?: number) {
  if (isRedisAvailable && slaQueue) {
    try {
      await slaQueue.add(name, data, { delay: delayMs });
      return;
    } catch (e) {
      // Fallback
    }
  }

  // In-process fallback: simulate delayed trigger or schedule
  if (delayMs && delayMs > 0) {
    setTimeout(() => {
      localEventBus.emit(name, data);
    }, Math.min(delayMs, 2147483647));
  } else {
    setImmediate(() => {
      localEventBus.emit(name, data);
    });
  }
}

export { isRedisAvailable, slaQueue };
