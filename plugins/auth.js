import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  // get users collection
  const users = fastify.mongo.db.collection('users');

  fastify.decorate('signup', async (request, reply) => {
    // get request body
    const requestUser = { ...request.body };

    try {
      // check if username or email already exist
      if (await users.findOne({ username: requestUser.username }))
        throw new Error('This username already exists');
      if (await users.findOne({ email: requestUser.email }))
        throw new Error('This email already exists');

      // hash the password and delete the passwordConfirm field
      requestUser.password = await fastify.bcrypt.hash(requestUser.password);
      delete requestUser.passwordConfirm;

      // create the new document and get the id
      const { insertedId: id } = await users.insertOne(requestUser);

      // get the new user to send as a reply
      const user = await users.findOne({ _id: id }, fastify.userQuery);

      // create a confirmation token and send the email confirmation
      const confirmationToken = await fastify.jwt.sign(
        { id },
        { expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRATION }
      );
      await fastify.sendConfirmationEmail(
        request.protocol,
        user,
        confirmationToken
      );

      reply.code(201);
      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'User created successfully',
      };
    } catch (error) {
      if (error.message === 'This username already exists')
        throw fastify.httpErrors.conflict(error.message);
      if (error.message === 'This email already exists')
        throw fastify.httpErrors.conflict(error.message);
      throw error;
    }
  });

  fastify.decorate('signupConfirmation', async (request, reply) => {
    const { confirmationToken } = request.params;

    try {
      const decoded = await fastify.jwt.verify(confirmationToken);

      // searching for the user
      const user = await users.findOne({
        _id: fastify.mongo.ObjectId(decoded.id),
      });

      // check if the user is already active and activing it, or send an error
      if (user.active === true) {
        throw new Error('User already activated');
      } else {
        user.active = true;
      }

      // updating the user
      await users.updateOne({ _id: user._id }, { $set: user });

      // sending the welcome email
      fastify.sendWelcomeEmail(user);

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'User activated successfully',
      };
    } catch (error) {
      if (error.message === 'User already activated')
        throw fastify.httpErrors.badRequest(error.message);
      throw error;
    }
  });

  fastify.decorate('confirmAccount', async (request, reply) => {
    const requestUser = { ...request.body };

    try {
      // getting the user from the db and checking if it exists
      const user = await users.findOne({ email: requestUser.email });
      if (!user) throw new Error('Incorrect email.');

      // checking if the password is correct
      if (!(await fastify.bcrypt.compare(requestUser.password, user.password)))
        throw new Error('Incorrect password.');

      // checking if the user is active
      if (user.active) throw new Error('Your account is already active');

      // create a confirmation token and send the email confirmation
      const confirmationToken = await fastify.jwt.sign(
        { id: user._id },
        { expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRATION }
      );
      await fastify.sendConfirmationEmail(
        request.protocol,
        user,
        confirmationToken
      );

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Email sent successfully',
      };
    } catch (error) {
      if (error.message === 'Your account is already active')
        throw fastify.httpErrors.badRequest(error.message);

      throw error;
    }
  });

  fastify.decorate('login', async (request, reply) => {
    const requestUser = { ...request.body };

    try {
      // getting the user from the db and checking if it exists
      const user = await users.findOne({ email: requestUser.email });
      if (!user) throw new Error('Incorrect email.');

      // checking if the password is correct
      if (!(await fastify.bcrypt.compare(requestUser.password, user.password)))
        throw new Error('Incorrect password.');

      // checking if the user is active
      if (!user.active) throw new Error('Your account is not verified');

      // deleting the password from the user object
      delete user.password;

      // creating the jwt token TEST
      const token = await reply.jwtSign(
        { id: user._id.toString() },
        { expiresIn: process.env.LOGIN_TOKEN_EXPIRATION }
      );

      // creating the cookie for the login
      reply.setCookie('jwt', token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        path: '/',
      });

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'You successfully logged in.',
      };
    } catch (error) {
      if (
        error.message === 'Incorrect email.' ||
        error.message === 'Incorrect password.'
      )
        throw fastify.httpErrors.unauthorized(error.message);

      if (error.message === 'Your account is not verified')
        throw fastify.httpErrors.badRequest(error.message);

      throw error;
    }
  });

  fastify.decorate('logout', async (request, reply) => {
    reply.setCookie('jwt', 'logout', {
      maxAge: '1',
      path: '/',
    });
    return {
      statusCode: reply.statusCode,
      statusMessage: 'OK',
      message: 'You successfully logged out.',
    };
  });

  fastify.decorate('forgotPassword', async (request, reply) => {
    try {
      // getting the email from the request
      const email = request.body.email;

      // checking if the user exists in the db
      const user = await users.findOne({ email });
      if (!user) throw new Error('The user does not exists');

      // creating the reset token and sending the email
      const resetToken = await fastify.jwt.sign(
        { id: user._id.toString() },
        { expiresIn: process.env.RESET_TOKEN_EXPIRATION }
      );
      await fastify.sendResetEmail(request.protocol, user, resetToken);

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Reset email sent.',
      };
    } catch (error) {
      if (error.message === 'The user does not exists')
        throw fastify.httpErrors.badRequest(error.message);
      throw error;
    }
  });

  fastify.decorate('resetPassword', async (request, reply) => {
    const { resetToken } = request.params;

    try {
      // verifying the reset token
      const decoded = await fastify.jwt.verify(resetToken);

      // searching for the user in the db
      const user = await users.findOne({
        _id: fastify.mongo.ObjectId(decoded.id),
      });

      // updating the user in the db with the new password
      await users.updateOne(
        { _id: user._id },
        { $set: { password: await fastify.bcrypt.hash(request.body.password) } }
      );

      return {
        statusCode: reply.statusCode,
        statusMessage: 'OK',
        message: 'Password changed succesfully.',
      };
    } catch (error) {
      throw error;
    }
  });
});
