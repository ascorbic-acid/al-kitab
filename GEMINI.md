# Al-Kitab (الكتاب)

Al-Kitab is a high-performance, offline-capable Quran reading application built with Nuxt 4 PWA and modern web technologies. It leverages Web Workers to provide a seamless search and reading experience.

## Project Overview

- **Framework:** Nuxt 4 (SPA mode)
- **UI Library:** Vuetify 3 with Material Design Icons
- **State Management:** Pinia
- **Database/Persistence:** 
  - **IndexedDB:** Key-value storage for application settings and state via `IDBSvc`.
  - **PGLite:** for now PGLite is not used at all in the project, we use web worker main.ts & api.ts to search and get surahs.
- **Concurrency:** Comlink-powered Web Workers for offloading API and DB operations from the main thread (`MWSvc`).
- **PWA:** Fully offline support via `@vite-pwa/nuxt` and custom service worker (`sw.ts`).
- **I18n:** Primary support for Arabic (`ar`) with RTL layout.

## Architecture & Design Patterns

### Service Locator Pattern
The project uses a custom `Locator` class (found in `app/services/locator.ts`) to manage service instances. Services must implement the `IService` interface and be registered with the `Locator` during application initialization.

- **Main Thread Services:** `IDBSvc` (IndexedDB), `MWSvc` (Worker Service).
- **Worker Thread Services:** The worker has its own `Locator` and services to handle data processing independently.

### Web Worker Integration
Heavy operations like fetching surahs and searching are delegated to a Web Worker (`app/workers/main.ts`) via `Comlink`. This ensures the UI remains responsive during data-intensive tasks.

### PWA & Service Worker
The application uses the `injectManifest` strategy for the Service Worker, allowing for fine-grained control over caching and offline behavior. The service worker source is located in `app/service-worker/`.

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Starts the development server on `ktb.local:3000`. |
| `pnpm run build` | Builds the application for production. |
| `pnpm run generate` | Static site generation (SSG). |
| `pnpm run typecheck` | Runs TypeScript type checking. |
| `pnpm run test` | Executes unit and component tests using Vitest. |
| `pnpm run lint` | Lints the codebase using ESLint. |
| `pnpm run format` | Formats code using Prettier. |
| `pnpm run clean` | remove folders .nuxt/ .output which may help fix strange issues and start clean.
| `pnpm run preview` | Previews the production build locally. |

## Development Conventions

- **General Tips:** When working on new feature or edit existing one or fix bugs always take chance to slowly moving thowards the following: make the code more "Nuxt-idiomatic, clean up surrounding code
  syntax, move to more clean code, nuxt/ts & web best practice and elemenate code repitability and impl some of the OOP, clean architecture and SOLID principles and so on, if you think the change is big
  feel free to ask first and explain your plan and give your tips then we can decide if we do them or keep it minimal.

- **Strict TypeScript:** The project uses strict type checking and work with typescript. Ensure all new code is properly typed.
- **Service Registration:** When adding a new global service, implement `IService`, register it in `app/plugins/app_init.ts`, and access it via `Locator.Instance.get(YourService)`.
- **RTL Support:** As an Arabic-first app, always consider RTL layout and Vuetify's RTL utilities.
- **Web Worker Offloading:** Any blocking or data-heavy logic should be moved to the worker API in `app/workers/api.ts` and exposed via `MWSvc`.
- **Formatting:** Adhere to the existing Prettier and ESLint configurations. Run `pnpm run format` before committing.

## Directory Structure

- `app/`: Main application source code.
  - `components/`: Vue components.
  - `composables/`: Shared Vue composables.
  - `models/`: TypeScript interfaces and models.
  - `services/`: Core application services (Locator-based).
  - `stores/`: Pinia stores.
  - `workers/`: Web Worker source code.
  - `service-worker/`: PWA service worker logic.
- `public/`: Static assets, including Quran data files (JSON, SQL).
- `locales/`: Localization files.
- `tests/`: Vitest and Nuxt test suites.
