import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  fastify.decorate('checkPermission', async (request, reply) => {
    try {
      // get users collection
      const users = fastify.mongo.db.collection('users');

      // checking if the token is valid
      const decoded = await request.jwtVerify();

      // getting the user from the db
      const user = await users.findOne(
        {
          _id: fastify.mongo.ObjectId(decoded.id),
        },
        {
          projection: {
            password: false,
            active: false,
          },
        }
      );
      if (!user) throw new Error('The user does not exists');

      request.user = user;
    } catch (error) {
      if (error.status === 401)
        throw fastify.httpErrors.unauthorized('You have to login.');
      throw error;
    }
  });

  fastify.decorate('checkAdmin', async (request, reply) => {
    try {
      if (!(request.user.role === 'admin'))
        throw new Error('You must me an administrator!');
    } catch (error) {
      if (error.message === 'You must me an administrator!')
        throw fastify.httpErrors.forbidden(error.message);
      throw error;
    }
  });
});
