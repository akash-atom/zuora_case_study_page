# @aw-webflow/zuora_case_study_page

## Project Overview

Custom JavaScript for a Webflow page. Published to npm as a scoped package under `@aw-webflow` and consumed by Webflow via the jsDelivr CDN.

## Coding Conventions

- All code must use `var` and ES5 syntax for broad browser compatibility in Webflow-published sites.
- Avoid `let`, `const`, arrow functions, template literals, and other ES6+ features.
- No build step transforms the final delivered script — what you write is what ships.

## Deployment

1. Push changes to GitHub.
2. Bump the version in `package.json`.
3. `npm publish --access public` (scoped packages require `--access public` for free npm accounts).
4. jsDelivr automatically serves the new version from npm.
5. Update the `<script>` tag version in Webflow if pinning to a specific version.

## Local Development

- `npm install` — install dependencies.
- `npm start` — runs `parcel script.js` for a local dev server.
