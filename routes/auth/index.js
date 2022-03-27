export default async (fastify, opts) => {
  fastify.route({
    method: 'POST',
    url: '/signup',
    schema: {
      body: fastify.signupSchema,
      response: fastify.responseSchema,
    },
    validatorCompiler: ({ schema }) => {
      return (data) => schema.validate(data);
    },
    handler: fastify.signup,
  });

  fastify.route({
    method: 'GET',
    url: '/signupConfirmation/:confirmationToken',
    schema: { response: fastify.responseSchema },
    handler: fastify.signupConfirmation,
  });

  fastify.route({
    method: 'POST',
    url: '/confirmAccount',
    schema: { body: fastify.loginSchema, response: fastify.responseSchema },
    validatorCompiler: ({ schema }) => {
      return (data) => schema.validate(data);
    },
    handler: fastify.confirmAccount,
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: { body: fastify.loginSchema, response: fastify.responseSchema },
    validatorCompiler: ({ schema }) => {
      return (data) => schema.validate(data);
    },
    handler: fastify.login,
  });

  fastify.route({
    method: 'GET',
    url: '/logout',
    schema: { response: fastify.responseSchema },
    handler: fastify.logout,
  });

  fastify.route({
    method: 'POST',
    url: '/forgotPassword',
    schema: {
      body: fastify.forgotPasswordSchema,
      response: fastify.responseSchema,
    },
    validatorCompiler: ({ schema }) => {
      return (data) => schema.validate(data);
    },
    handler: fastify.forgotPassword,
  });

  fastify.route({
    method: 'PATCH',
    url: '/resetPassword/:resetToken',
    schema: {
      body: fastify.resetPasswordSchema,
      response: fastify.responseSchema,
    },
    validatorCompiler: ({ schema }) => {
      return (data) => schema.validate(data);
    },
    handler: fastify.resetPassword,
  });
};
