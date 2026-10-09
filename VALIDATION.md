# Distribution validation

Distribution checks rerun 2026-10-09; documentary source review dated 2026-10-08.

## Reproducible checks

From the extracted directory, with Node.js installed:

```
node tests/validate.cjs
node tests/package-check.cjs
```

- Deterministic gameplay/data validation passed for all 19,435 practice targets in 104 playable countries/regions and 312 map-layout cases.
- Package checks passed for JavaScript syntax, local asset references, legacy progress keys, required notices and absence of internal machine paths.
- Independent comparison against the supplied offline release confirmed unchanged city records, IDs, ordering, coordinates, country membership, geometry and storage version. Application gameplay code, CSS and bundled font are unchanged; the distribution changes concern display branding, source/licensing notices and coverage-evidence metadata.
- The coverage review contains 105 unique country/region records. Monaco is reviewed but is not playable. All 104 playable pools are retained. The four specialist-supported entries explicitly identify their evidence type and medium confidence.
- No credentials, private configuration directories, repository history or externally loaded map tiles/panorama assets are included.

## Verification limits

A new browser interaction/visual run could not be completed in the validation environment: its local Chromium launch was blocked, and its supported browser did not permit local-file URLs. The deterministic checks above are not a substitute for browser rendering and interaction tests. Open `index.html` after extraction to check the app in your target browser before publishing.

Source links require internet access. Source evidence was reviewed as documentary evidence; no live panorama availability or every-city coverage certification was performed. See the coverage manifest and README for geographic and source-quality limits.
