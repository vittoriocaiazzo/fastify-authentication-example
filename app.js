// import modules
import Fastify from 'fastify';
import autoLoad from 'fastify-autoload';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

// creating __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// creating the server
const fastify = Fastify({ maxParamLength: 300 });
if (!process.env.PORT) process.env.PORT = 3000;

// registering the plugins
fastify.register(import('fastify-sensible'), {
  errorHandler: false,
});

fastify.register(import('fastify-mongodb'), {
  forceClose: true,
  url: process.env.DB_PATH,
});

fastify.register(import('fastify-jwt'), {
  secret: async () => process.env.JWT_KEY,
  cookie: {
    cookieName: 'jwt',
    signed: false,
  },
});

fastify.register(import('fastify-mailer'), {
  transport: {
    port: process.env.MAILHOG_PORT,
  },
});

fastify.register(import('fastify-cookie'), {
  secret: process.env.COOKIE_SECRET,
});

fastify.register(import('fastify-bcrypt'), {
  saltWorkFactor: 12,
});

fastify.register(autoLoad, {
  dir: join(__dirname, 'plugins'),
});
fastify.register(autoLoad, {
  dir: join(__dirname, 'routes'),
});

// starting the server
const start = async () => {
  try {
    await fastify.listen(process.env.PORT);
    console.log(
      chalk.green(
        `\n💥 Server listening on http://127.0.0.1:${process.env.PORT}`
      )
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
