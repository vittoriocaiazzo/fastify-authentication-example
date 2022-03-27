import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  fastify.decorate('userQuery', {
    projection: {
      _id: false,
      password: false,
      passwordConfirm: false,
      role: false,
      active: false,
    },
  });
});
