# @aw-webflow/zuora_case_study_page

Custom JavaScript for a Webflow page, published to npm and served via jsDelivr.

## Usage via jsDelivr CDN

Add the following `<script>` tag to your Webflow page settings (before `</body>`):

```html
<script src="https://cdn.jsdelivr.net/npm/@aw-webflow/zuora_case_study_page@1.1.0/script.min.js"></script>
```

Replace `1.0.0` with the latest published version, or use `@latest` to always pull the most recent release.

## Deployment Workflow

1. Push changes to GitHub.
2. Bump the `version` in `package.json`.
3. Run `npm publish --access public`.
4. Update the version in your Webflow `<script>` tag to pull the new release from jsDelivr.

## Local Development

```bash
npm install
npm start
```

`npm start` runs `parcel script.js` and serves a local dev build.
