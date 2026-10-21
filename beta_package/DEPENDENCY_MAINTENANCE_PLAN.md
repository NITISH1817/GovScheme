# GovScheme Dependency Maintenance Plan

**Document Version:** 1.0.0-beta  
**Phase:** Controlled Beta Preparation (Phase 10)  
**Policy Status:** Lockfile Frozen — Zero Package Modifications During Beta Preparation  

---

## 1. Dependency Audit Overview

An audit of the GovScheme dependency tree reveals **10 advisory items** (3 Moderate, 7 High):

```
+--------------------------+----------+-----------------------------------+--------------------+------------------------+
| Package Name             | Severity | Advisory Identifier               | Dependency Source  | Production Exposure    |
+--------------------------+----------+-----------------------------------+--------------------+------------------------+
| braces                   | High     | GHSA-vfj7-8cjw-p6xm               | chokidar / tailwind| Build/Dev Only (None)  |
| chokidar                 | High     | GHSA-vfj7-8cjw-p6xm (via braces)  | tailwindcss 3.4.x  | Build/Dev Only (None)  |
| micromatch               | High     | GHSA-vfj7-8cjw-p6xm (via braces)  | fast-glob / tailwind| Build/Dev Only (None) |
| fast-glob                | High     | GHSA-vfj7-8cjw-p6xm (via micromatch)| tailwindcss 3.4.x| Build/Dev Only (None)  |
| postcss-selector-parser  | Moderate | GHSA-rj75-hqrm-r3gf               | postcss-nested     | Build/Dev Only (None)  |
| postcss-nested           | Moderate | GHSA-rj75-hqrm-r3gf (via parser)  | tailwindcss 3.4.x  | Build/Dev Only (None)  |
| esbuild                  | Moderate | GHSA-67mh-4wv8-2f99               | vite 6.x bundler   | Build/Dev Only (None)  |
| vite                     | Moderate | GHSA-67mh-4wv8-2f99 (via esbuild) | devDependencies    | Build/Dev Only (None)  |
| follow-redirects         | High     | GHSA-q3jh-wrc6-jgq8               | Transitive tool    | Build/Dev Only (None)  |
| follow-redirects         | High     | GHSA-8r9p-f939-6h3c               | Transitive tool    | Build/Dev Only (None)  |
+--------------------------+----------+-----------------------------------+--------------------+------------------------+
```

---

## 2. Production Exposure & Risk Assessment

### Static Build Separation
* All 10 reported vulnerabilities reside exclusively in **build tooling, compilation utilities, and local development file watchers** (`tailwindcss`, `chokidar`, `vite`, `esbuild`).
* **Browser Runtime:** The production frontend is built as optimized, static JavaScript chunks served over Vercel's Edge CDN. Build-time utilities (`chokidar`, `micromatch`, `esbuild`) are stripped from the distribution bundle (`dist/`).
* **Express Backend Runtime:** The Node.js production service (`server/server.js`) does not import or execute `tailwindcss`, `vite`, or `esbuild`. It runs purely as an API server handling JSON requests.
* **Conclusion:** There is **zero production runtime attack surface** exposed to citizens or external clients from these build-time advisories.

---

## 3. Why `npm audit fix --force` Is Prohibited

Executing `npm audit fix --force` at this stage is strictly forbidden due to severe breaking architectural changes:

1. **Tailwind CSS v4 Migration Risk:**
   * `npm audit fix --force` attempts to upgrade to `tailwindcss@4.3.3`.
   * Tailwind CSS v4 is an incompatible architectural rewrite: it removes `tailwind.config.js` and `postcss.config.js` in favor of `@tailwindcss/vite` and CSS-based theme imports.
   * Upgrading will break existing custom GovScheme utility extensions, brand color tokens (`gov-blue`, `saffron`, `ashoka`), and component styling.
2. **Vite v8 Breaking Upgrade Risk:**
   * `npm audit fix --force` forces `vite@8.3.5`.
   * This breaks active Vite plugins, SSR configurations, and development server middleware tailored for Vite 6.

---

## 4. Controlled Post-Beta Patch Plan

Following the completion of the controlled pilot, dependencies will be updated according to this phased, non-breaking protocol:

### Phase A: Safe In-Range Patches (Targeted Patch Updates)
* **Goal:** Update packages within their current major/minor semantic version ranges without breaking configs.
* **Action Items:**
  1. Update `tailwindcss` to the latest patch release on the 3.4.x LTS branch:
     ```bash
     npm install --save-dev tailwindcss@^3.4.17
     ```
  2. Apply selective package override in `package.json` for `follow-redirects` and `braces` to resolve sub-dependency advisories cleanly:
     ```json
     {
       "overrides": {
         "follow-redirects": ">=1.16.1",
         "braces": ">=3.0.3"
       }
     }
     ```
  3. Run `npm install` without `--force`.

### Phase B: Verification & Quality Gates
Before any dependency change is merged:
1. **Full Regression Test Suite:** Execute all 14 test suites (`npm test`) -> Must pass with 100% exit code 0.
2. **Type Safety Audit:** Execute `npx tsc --noEmit` -> Must produce 0 errors.
3. **Production Build Guard:** Execute `npm run build` with `VITE_API_URL` set -> Must compile without chunk warnings or syntax errors.
4. **Visual Regression Check:** Verify that Tailwind UI components, theme gradients, and modals render identically across mobile (320px) and desktop (1440px).

### Phase C: Scheduled Major Version Migrations (Post-General Availability)
* Schedule a dedicated sprint for Tailwind CSS v4 and Vite modern bundler migration with full redesign regression testing.
