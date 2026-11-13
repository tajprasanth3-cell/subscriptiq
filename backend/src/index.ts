import { createApp } from './app';
import { env } from './config/env';
import { getStore, storePath } from './store/store';

function bootstrap(): void {
  // Initialise the store eagerly so seed/persistence errors surface at startup.
  const store = getStore();
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log('');
    console.log('  SubscriptIQ API');
    console.log(`  Environment : ${env.nodeEnv}`);
    console.log(`  Listening   : http://localhost:${env.port}`);
    console.log(`  Data store  : ${storePath()}`);
    console.log(
      `  Seed        : ${store.data.plans.length} plans, ${store.data.customers.length} customers, ${store.data.events.length} events`
    );
    console.log('');
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(() => {
      store.persist();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap();
