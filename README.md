# Shopizer Administration (`shopizer-admin`)

Angular web admin application for Shopizer.

## Requirements

- Node.js `v22.x` (tested with `v22.21.0`)
- npm `v10.x` (tested with `10.9.4`)
- Angular CLI `21.2.0` (latest stable at the time of update)

Install Angular CLI globally:

```bash
npm install -g @angular/cli@latest
```

Verify:

```bash
which ng
ng version
```

If you get `zsh: command not found: ng`, install again with the command above and ensure your npm global bin is in `PATH`.

## Install

```bash
npm install --legacy-peer-deps
```

## Run locally

Run backend first (from the Shopizer backend runnable module, not the aggregator root):

```bash
cd <shopizer-backend>/sm-shop
mvn spring-boot:run
```

Then run the Angular admin app:

```bash
npm start -- --host 127.0.0.1 --port 4200
```

Open:

- `http://127.0.0.1:4200`
- This app uses hash routing (`useHash: true`), for example:
  - `http://127.0.0.1:4200/#/auth/login`
  - `http://127.0.0.1:4200/#/pages`

## Build

```bash
npm run build
```

## Test

```bash
npm test -- --watch=false --browsers=ChromeHeadlessCI
```

Note:

- Current test run exits successfully but executes `0` specs in this workspace (`TOTAL: 0 SUCCESS`).

## Backend/API configuration

Development API values:

- `src/environments/environment.ts`
  - `apiUrl`: `http://localhost:8080/api`
  - `shippingApi`: `http://localhost:9090/shipping/api/v1`

Production/runtime API values come from `window.env` (in `src/environments/environment.prod.ts`), typically injected via `src/assets/env.js` or `src/assets/env.template.js`:

- `APP_BASE_URL`
- `APP_SHIPPING_URL`
- `APP_MAP_API_KEY`
- `APP_DEFAULT_LANGUAGE`

## Smoke checks used during upgrade

Backend:

```bash
curl -i http://127.0.0.1:8080/
curl -i http://127.0.0.1:8080/v3/api-docs
```

Auth + protected API:

```bash
curl -s -X POST http://127.0.0.1:8080/api/v1/private/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"iamskk1@gmail.com","password":"password"}'
```

## Run docker image

Assumes backend runs on `http://localhost:8080/api`.

```bash
docker run \
  -e "APP_BASE_URL=http://localhost:9090/api" \
  -it --rm -p 4200:80 shopizerecomm/shopizer-admin
```

## Default login

- Seeded user used in upgrade validation:
  - Username: `iamskk1@gmail.com`
  - Password: `password`
