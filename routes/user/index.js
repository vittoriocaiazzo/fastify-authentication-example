export default async (fastify, opts) => {
  fastify.register(import('fastify-auth')).after(() => {
    fastify.route({
      method: 'GET',
      url: '/myProfile',
      schema: { response: fastify.responseMyProfileSchema },
      preHandler: fastify.auth([fastify.checkPermission]),
      handler: fastify.myProfile,
    });

    fastify.route({
      method: 'PATCH',
      url: '/changePassword',
      schema: {
        body: fastify.changePasswordSchema,
        response: fastify.responseSchema,
      },
      validatorCompiler: ({ schema }) => {
        return (data) => schema.validate(data);
      },
      preHandler: fastify.auth([fastify.checkPermission]),
      handler: fastify.changePassword,
    });

    fastify.route({
      method: 'PATCH',
      url: '/changeName',
      schema: {
        body: fastify.changeNameSchema,
        response: fastify.responseSchema,
      },
      validatorCompiler: ({ schema }) => {
        return (data) => schema.validate(data);
      },
      preHandler: fastify.auth([fastify.checkPermission]),
      handler: fastify.changeName,
    });

    fastify.route({
      method: 'DELETE',
      url: '/deleteMe',
      schema: { response: fastify.responseSchema },
      preHandler: fastify.auth([fastify.checkPermission]),
      handler: fastify.deleteMe,
    });

    fastify.route({
      method: 'GET',
      url: '/allUsers',
      schema: { response: fastify.responseAllUsersSchema },
      preHandler: fastify.auth([fastify.checkPermission, fastify.checkAdmin], {
        relation: 'and',
      }),
      handler: fastify.allUsers,
    });

    fastify.route({
      method: 'DELETE',
      url: '/deleteAccount',
      schema: {
        body: fastify.deleteAccountSchema,
        response: fastify.responseSchema,
      },
      validatorCompiler: ({ schema }) => {
        return (data) => schema.validate(data);
      },
      preHandler: fastify.auth([fastify.checkPermission, fastify.checkAdmin], {
        relation: 'and',
      }),
      handler: fastify.deleteAccount,
    });
  });
};
