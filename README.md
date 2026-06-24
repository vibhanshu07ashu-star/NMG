# NMG

A simple Trello-like project containing a Laravel backend and a Vite + React frontend.

## Repository layout

- [backend](NMG/backend/README.md): Laravel API and models.
- [frontend](NMG/frontend/README.md): Vite + React UI built with Tailwind.

## Requirements

- PHP 8.1+ and Composer
- MySQL or compatible database
- Node.js 18+ and npm or Yarn

## Quick start (local)

1. Backend

```bash
cd NMG/backend
cp .env.example .env
composer install
php artisan key:generate
# edit .env to configure DB credentials
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

2. Frontend

```bash
cd NMG/frontend
npm install
npm run dev
# open http://localhost:5173 (or the port printed by Vite)
```

## Tests

- Backend: from `NMG/backend` run `./vendor/bin/phpunit` (or `php artisan test`).
- Frontend: run `npm test` in `NMG/frontend` if tests are configured.

## Useful files

- Backend env template: [NMG/backend/.env.example](NMG/backend/.env.example)
- Backend migrations: [NMG/backend/database/migrations](NMG/backend/database/migrations)
- Frontend entry: [NMG/frontend/src/main.jsx](NMG/frontend/src/main.jsx)

## Notes

- The `vendor/` directory (backend) and `node_modules/` (frontend) are not tracked here — install dependencies locally.
- If you plan to deploy, set `APP_ENV`, `APP_DEBUG`, and database credentials in the backend `.env` appropriately.

## Contributing

Open an issue or submit a PR with changes. Keep backend and frontend concerns separated and include migration changes with schema updates.

## License

MIT
