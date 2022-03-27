import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  // get users collection
  const users = fastify.mongo.db.collection('users');

  fastify.decorate('myProfile', async (request, reply) => {
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'Successfully got your profile',
      myProfile: request.user,
    };
  });

  fastify.decorate('changePassword', async (request, reply) => {
    // getting the old password and the new password
    const { oldPassword, password } = request.body;

    try {
      // getting the user from the db thanks to the user saved in the request object
      const user = await users.findOne({ _id: request.user._id });

      // checking if the old password is correct
      if (!(await fastify.bcrypt.compare(oldPassword, user.password)))
        throw new Error('Password incorrect!');

      // update the user with the new password
      await users.updateOne(
        { _id: user._id },
        { $set: { password: await fastify.bcrypt.hash(password) } }
      );

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Successfully changed your password.',
      };
    } catch (error) {
      if (error.message === 'Password incorrect!')
        throw fastify.httpErrors.conflict(error.message);

      throw error;
    }
  });

  fastify.decorate('changeName', async (request, reply) => {
    // getting the name
    const { firstName, lastName } = request.body;

    try {
      // getting the user from the db thanks to the user saved in the request object
      const user = await users.findOne({ _id: request.user._id });

      // update the user with the new name
      await users.updateOne(
        { _id: user._id },
        { $set: { firstName, lastName } }
      );

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Successfully changed your name.',
      };
    } catch (error) {
      throw error;
    }
  });

  fastify.decorate('deleteMe', async (request, reply) => {
    try {
      await users.deleteOne({ _id: request.user._id });

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Successfully deleted your account.',
      };
    } catch (error) {
      throw error;
    }
  });

  fastify.decorate('allUsers', async (request, reply) => {
    try {
      const allUsers = await users.find();
      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Successfully got all the users.',
        users: await allUsers.toArray(),
      };
    } catch (error) {
      throw error;
    }
  });

  fastify.decorate('deleteAccount', async (request, reply) => {
    // getting the account to delete from the request body
    const emailToDelete = request.body.email;
    try {
      // getting the user to delete from the db
      const deletedAccount = await users.deleteOne({ email: emailToDelete });
      console.log(deletedAccount);
      if (!deletedAccount.deletedCount)
        throw new Error('There is no account with this email!');

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Successfully deleted the account.',
      };
    } catch (error) {
      if (error.message === 'There is no account with this email!')
        throw fastify.httpErrors.notFound(error.message);
      throw error;
    }
  });
});
