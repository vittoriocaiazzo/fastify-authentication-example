import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  fastify.decorate(
    'sendConfirmationEmail',
    async (protocol, user, confirmationToken) => {
      const url = `${protocol}://localhost:${process.env.PORT}/auth/signupConfirmation/${confirmationToken}`;
      await fastify.mailer.sendMail({
        from: 'auth@example.com',
        to: user.email,
        subject: 'Registration',
        text: `Hello ${user.firstName}! Please click here to activate your account! ${url}`,
      });
    }
  );

  fastify.decorate('sendWelcomeEmail', async (user) => {
    await fastify.mailer.sendMail({
      from: 'auth@example.com',
      to: user.email,
      subject: 'Welcome!',
      text: `Your account has been activated!`,
    });
  });

  fastify.decorate('sendResetEmail', async (protocol, user, resetToken) => {
    const url = `${protocol}://localhost:${process.env.PORT}/auth/resetPassword/${resetToken}`;
    await fastify.mailer.sendMail({
      from: 'auth@example.com',
      to: user.email,
      subject: 'Reset Password',
      text: `Hello ${user.firstName}! Please click here to reset your password! ${url}`,
    });
  });
});
