# WebSafe

An easy to understand implementation of the principle of Vaultwarden in a Python FastAPI + React JS application

A live version can be found here: [https://gruppe4.testsites.info](https://gruppe4.testsites.info)

If you want to learn about the client-side encryption, here are some resources on that:

- [https://blog.cozy.io/en/cozy-cloud-how-to-encrypt-web-application/](https://blog.cozy.io/en/cozy-cloud-how-to-encrypt-web-application/)
- [https://github.com/cozy/cozy-stack/blob/master/docs/bitwarden.md](https://github.com/cozy/cozy-stack/blob/master/docs/bitwarden.md)

## Usage

To deploy this application yourself, take a look at the `deploy` folder. There are some `docker-compose.yaml` sample config files there.
This should give you an idea about hosting the application.

## Features

The functionality is pretty simple. You can

- register new users
- log in with existing users
- add password entries to your safe
- delete your account
- change your account
- delete your account using a email as confirmation (needs SMTP server)

If you set up a SMTP server, each new user will be greeted upon registration. They can delete their accounts with an email verification if they forget their password.

## Developing

There is an example dev setup in the `deploy` folder of this repository. It starts a backend using `websafe.localhost/api/v1` via Traefik as route.
To start the frontend, just use `npm install` and `npm start` in the `frontend` folder.
The backend can be started manually, too, if that is wanted. Use uvicorn for that in the `backend` folder:

```
uvicorn  app.api:app
```
