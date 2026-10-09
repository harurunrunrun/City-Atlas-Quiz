# City Atlas Quiz

An offline-ready geography quiz and study atlas. Open `index.html` with all extracted files together in a modern browser. No installation, game account, API key, or network connection is needed for the app. Source links require the internet.

## Public package

The JavaScript, HTML and CSS are readable source; there is no build step, backend or dependency install. Run `node tests/validate.cjs` and `node tests/package-check.cjs` for the included deterministic gameplay/data and distribution checks (Node.js required only for tests). See `PUBLISHING.md` for optional GitHub upload and Pages instructions. No publication is performed by opening this package.

No new application-code license is granted in this distribution; the supplied original had no separate code-license grant. Original source terms remain applicable. See `LICENSE.txt` for scope, `THIRD_PARTY_NOTICES.md` for data/source notices and `fonts/NOTO-LICENSE.txt` for the font license. This is an educational snapshot, not an authoritative geographic or legal reference.

## Quiz modes

- **Streak:** A country/region is picked with equal probability each round. The target is random within its city pool. Correct answers add one; a wrong answer ends the run. The local best score is saved.
- **Country practice:** Choose a country/region, including through **Choose on map**. Every indexed city is a target once in a shuffled pass. Wrong answers do not repeat. The final result shows correct answers and accuracy.
- **Weak cities:** A place is weak if its latest attempted answer was wrong. A pass snapshots that country's current weak cities, asks each once, and does not requeue errors. Correct answers clear the weak flag. Distractors use the full country pool.

Choose a map letter or use keys 1–4. Letters are ordered from northeast toward southwest using the actual projected city positions. Targets remain random. Choices avoid duplicate local or English display names and are selected for geographic separation. When a closer view is needed, a small country overview keeps the context. Compact markers stay the same size when zooming; leader lines terminate at real city coordinates. Use the mouse wheel or trackpad over any quiz map to zoom in and out around the cursor; the + / − buttons remain available. No modifier key is needed. Drag the map background or a pin letter to pan without selecting text; a tap or click on a pin still answers. Scrolling and text selection outside the map stay normal. Every question can zoom out beyond its initial close-up. **Whole country** fits every mapped component of the country/region, and **Fit cities** restores the starting question view. Camera changes, including resize and returning from the atlas, do not change the cities, A–D identities, answers or progress.

**Reset progress**, beside the Country practice progress bar, asks for confirmation and starts a new shuffled pass through the full current country pool, with answered and correct counts back at zero. Cancel keeps the exact question and progress. Other countries and modes, your streak and best, name preference, and city answer history stay. In Weak cities, **Reset weak pass** rebuilds only that pass from the currently weak cities, keeping the history. The reset is saved in this browser.

The **Choose on map** country picker supports cursor-centered mouse-wheel/trackpad zoom and + / − buttons from 1× to 512×, plus drag panning. **Whole world** restores the initial view. Zooming and dragging do not choose a country; confirm the highlighted country to switch, or use Cancel/Escape to retain the current quiz. The dropdown remains available for small countries.

## Study atlas

Click a highlighted country/region on the world map, or use its dropdown. Grey areas outside the playable pool remain geographic context. Every indexed city in the current view has a dot and a searchable list entry. On-map labels show local and English names on separate lines, unless the names are identical or Local names only is enabled. Labels are viewport-aware and avoid overlap at ordinary zoom; there is no fixed label-count ceiling. At maximum zoom all visible names are shown. Hover prioritizes a location; selecting it keeps a readable label visible. Records sharing exact coordinates can be inspected individually through the selected-location chooser.

Use the state/province/region selector to focus on a subdivision. **All country** restores the full pool. Counts include every indexed city; zero-city regions and an Unknown region bucket are retained where needed. Sourced outlines are available for the United States, Canada, Brazil, Australia, India and Russia. Elsewhere, a regional view fits its indexed cities and explicitly says that the regional outline is unavailable. Regional membership includes seven documented Indian administrative-code corrections.

- Use the mouse wheel or trackpad over either atlas map to zoom around the cursor. The world map supports 1×–32×. Country-map limits adapt to the closest distinct city points, up to 32,768×, so dense locations can be inspected; buttons remain available.
- Drag with the left mouse button to pan. Map graphics do not trigger text selection. Scrolling and selecting text in the city list or elsewhere remain normal.
- Selecting a city highlights it without changing zoom. If it is outside the current view, the map pans to show it. Repeated list clicks do not zoom. Resize preserves the geographic focus and keeps the selected place visible at the same zoom.
- Returning to Quiz preserves the current question and pass. Studying, panning, zooming and changing atlas regions never record an answer.

## Local names only

The shared switch applies to all quiz modes and the atlas. It removes English city translations/romanizations from prompts, reveals, map labels and accessible labels. Local names that are English remain visible. Source-spelling annotations remain. Sourced local region/district qualifiers are used where available; neutral region codes and stable place IDs distinguish unresolved same-name cases. Interface and country/region names remain English.

The switch does not change the current question, ordering, score, pass or answer history. Its preference is saved in this browser.

## Expanded pools and saved progress

The current release contains **19,435 playable places in 104 countries/regions**. Japan remains at 200. Norway has 185 places, Canada 1,028, Australia 902 and Russia 1,345. Puerto Rico has 31, the Faroe Islands 12 and Greenland 15.

Counts scale with population and land area: the larger of the population ratio and square root of the area ratio relative to Japan is multiplied by 200, with a floor of 12 and usual cap of 3,000, limited by usable source places. Regional spread matters, and all previously published city IDs are retained. These are mixed-year gazetteer-based pools, not certified current census rankings. Small-country pools include towns; Singapore uses towns/neighbourhoods. Before/after country counts are in About.

An already-started country pass can finish its original city snapshot. Its targets, completed answers and outcomes are preserved, while names are reloaded from the current dataset. The interface explains when a saved pass uses the smaller old pool. Start another pass to cover the expanded pool. City history, weak flags and the best streak remain. The legacy `city-streak-v1` storage key and data storage version are intentionally retained for compatibility on the same browser origin. Renaming the app does not migrate storage to a new domain or file location. Browser storage does not sync across devices; if storage is blocked, progress lasts only for the current visit.

## Coverage and territory scope

Coverage eligibility was independently re-reviewed on **8 October 2026** using the documentary sources in `city_quiz_coverage.json`. Sources include Google and official-partner announcements, government sources, research, original reporting and specialist-community documentation. Each record identifies its evidence and limitations. This is a re-review of an existing app, not a claim that the original project was created in a clean-room process or that legal/trademark clearance was obtained.

The criterion is documented released official Google or official-partner road imagery, with explicit exceptions for the Faroe Islands (mixed street/Trekker imagery) and the Greenland whitelist below. Geographic extent can be limited. Türkiye and San Marino use medium-confidence original reporting/partner-announcement evidence rather than a newly located Google road-release announcement. **Dominican Republic, São Tomé and Príncipe, Jordan and Qatar remain playable on medium-confidence independent specialist-community evidence from Plonk It.** Its guide limits its scope to official Google coverage; this is not a newly verified primary Google road-release announcement. The individual manifest entries identify geographic limitations. Only brief factual eligibility statements and source links are included, not guide prose, images or clue graphics.

Other dependent territories are not automatically included. Monaco is reviewed but unavailable because the selected source has fewer than four qualifying distinct places. Documentary release evidence does not establish that all historical imagery remains accessible today; no live panorama checks were performed.

Greenland is a specific exception: only 15 positively documented towns with official or official-partner local street/Trekker imagery are included. Its ice-sheet area never increases the pool. This is not blanket road coverage or a claim about every street or the exact city-label coordinate. The towns are Nuuk, Sisimiut, Ilulissat, Qaqortoq, Aasiaat, Maniitsoq, Tasiilaq, Uummannaq, Narsaq, Paamiut, Qasigiannguit, Qeqertarsuaq, Qaanaaq, Kangaatsiaq and Kangerlussuaq.

`city_quiz_coverage.json` contains coverage decisions and source links. Ordinary country eligibility does not claim that every sampled city's streets are covered.

## Neutral maps and source limitations

Selected disputed areas, including the four Northern Territories/Southern Kuril island groups, use opaque neutral grey above country and regional fills. Their legend and accessible text read **Disputed area · affiliation not shown**. They do not select an underlying country. Affected city dots and detail panels are annotated; IDs, source-pool grouping and progress are retained.

The 42-area overlay is a bounded, generalized Natural Earth reference, not a comprehensive current legal-dispute or frontline map. Boundaries, colors, place names, and country/region groupings are used for geographic learning and navigation. They do not express a position on sovereignty, territorial claims, or disputed or undetermined status. Country outlines, region outlines and city coordinates can differ near simplified coasts or borders. Real town coordinates are never moved to hide those differences; this particularly matters for Greenland and the Faroe Islands.

## Name audit

The source audit screened 19,436 retained records, including the one non-playable Monaco record. It corrected 636 display fields across 629 city records in 46 countries/regions. All 200 Japanese local names were checked against official municipality entries; Ichihara is **市原市**. Additional metadata corrections are documented separately.

This combines whole-corpus source-consistency checks with targeted external review; it does not independently certify every city name worldwide. There are 289 remaining review candidates, not 289 proven errors. 3,695 records explicitly use qualified **Source spelling** where a sufficiently supported local-language label was unavailable. English source forms/romanizations are qualified as well. No translation is invented to fill a missing label.

See `audit/README.md`, `audit/corrections.json`, and `audit/unresolved_review.csv` for the review's scope, before/after records, evidence and remaining limits. The corrected source dataset checksum is `119cb0bae602c8b0c77a0c24638b0f884ad0dfb8d6da1b90fd39ecc27e63214e`.

## Sources and licences

- GeoNames: https://www.geonames.org/ and https://download.geonames.org/export/dump/ . Geographic data adapted under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . Names, selection and metadata are adapted.
- Wikidata supplementary language labels: CC0, https://www.wikidata.org/wiki/Wikidata:Licensing .
- Natural Earth country, administrative and selected disputed-area geometry: public domain, https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ and https://www.naturalearthdata.com/about/terms-of-use/ . Made with Natural Earth.
- Bundled Noto Serif Tibetan: SIL Open Font License 1.1, `fonts/NOTO-LICENSE.txt`.

Keep `THIRD_PARTY_NOTICES.md` with redistributions. GeoNames data is provided as is, without warranty of accuracy, timeliness or completeness.

This quiz is independent and is not affiliated with Google or GeoGuessr. No online map tiles or paid services are loaded.
