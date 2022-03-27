import fp from 'fastify-plugin';
import chalk from 'chalk';

export default fp(async (fastify, opts) => {
  fastify.addHook('onRequest', async (request, reply) => {
    console.log(
      chalk.yellow(`\n❓ ${request.method} request on ${request.url}`)
    );
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const response = {
      statusCode: reply.statusCode,
      statusMessage: reply.raw.statusMessage,
      headers: reply.getHeaders(),
    };
    console.log(chalk.yellow(`\n❗️ Responded with: `), response);
    console.log(
      chalk.green(
        `\n💥 Server listening on http://127.0.0.1:${process.env.PORT}`
      )
    );
  });
});
