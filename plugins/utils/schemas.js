import fp from 'fastify-plugin';
import Joi from 'joi';

export default fp(async (fastify, opts) => {
  fastify.decorate(
    'signupSchema',
    Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      username: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'
          )
        )
        .required(),
      passwordConfirm: Joi.string()
        .equal(Joi.ref('password'))
        .messages({ 'any.only': 'Passwords does not match' })
        .required(),
      role: Joi.string().valid('admin', 'standard').default('standard'),
      active: Joi.bool().default(false),
    })
  );

  fastify.decorate(
    'loginSchema',
    Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'
          )
        )
        .required(),
    })
  );

  fastify.decorate(
    'forgotPasswordSchema',
    Joi.object().keys({
      email: Joi.string().email().required(),
    })
  );

  fastify.decorate(
    'resetPasswordSchema',
    Joi.object().keys({
      password: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'
          )
        )
        .required(),
      passwordConfirm: Joi.string()
        .equal(Joi.ref('password'))
        .messages({ 'any.only': 'Passwords does not match' })
        .required(),
    })
  );

  fastify.decorate(
    'changePasswordSchema',
    Joi.object().keys({
      oldPassword: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'
          )
        )
        .required(),
      password: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'
          )
        )
        .required(),
      passwordConfirm: Joi.string()
        .equal(Joi.ref('password'))
        .messages({ 'any.only': 'Passwords does not match' })
        .required(),
    })
  );

  fastify.decorate(
    'changeNameSchema',
    Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    })
  );

  fastify.decorate(
    'deleteAccountSchema',
    Joi.object().keys({
      email: Joi.string().email().required(),
    })
  );

  fastify.decorate('responseSchema', {
    '2xx': {
      type: 'object',
      additionalProperties: false,
      properties: {
        statusCode: { type: 'number' },
        statusMessage: { type: 'string' },
        message: { type: 'string' },
      },
    },
  });

  fastify.decorate('responseMyProfileSchema', {
    '2xx': {
      type: 'object',
      additionalProperties: false,
      properties: {
        statusCode: { type: 'number' },
        statusMessage: { type: 'string' },
        message: { type: 'string' },
        myProfile: { type: 'object' },
      },
    },
  });

  fastify.decorate('responseAllUsersSchema', {
    '2xx': {
      type: 'object',
      additionalProperties: false,
      properties: {
        statusCode: { type: 'number' },
        statusMessage: { type: 'string' },
        message: { type: 'string' },
        users: { type: 'array' },
      },
    },
  });
});
