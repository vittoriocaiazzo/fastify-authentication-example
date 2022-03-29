This is an authentication example using Fastify.

## Features

- The registration requires a name, a username, an email and a password.
- The password must be confirmed.
- The user can be set as admin or standard.
- The signup process includes a verification email with a confirmation link (mailhog).
- The login works through the email and the password.
- There is a "Forgot Password?" feature that includes an email with a reset link.
- Users can retrieve their profile and change name and password.
- Users can delete their account.
- If the user is an admin, all the users can be listed.
- Users can be deleted by an admin.

## Description

The server is a fastify app with public, private and admin routes. The users are stored in a Mongo database. The authentication is based on jwt and cookies. The server can send emails for the registration process and the forgot password feature (through nodemailer and mailhog as test purpose). In the .env file there are all the configurations for the jwt, the cookies and the email info.
