import "dotenv/config";

import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./lib/supabaseDb";

// PORT: defaults to 3001 for local dev; set by Replit artifact system in production
const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 3001;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Run DB migrations before accepting traffic
runMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to run migrations, starting anyway");
    app.listen(port, (err2) => {
      if (err2) {
        logger.error({ err: err2 }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  });