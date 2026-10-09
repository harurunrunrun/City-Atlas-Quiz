# City Streak worldwide name audit

2026-10-07. Deliverable: `cities.corrected.json` (SHA-256 `119cb0bae602c8b0c77a0c24638b0f884ad0dfb8d6da1b90fd39ecc27e63214e`).

## Archive scope

This directory preserves the 2026-10-07 name-review records. References to upstream audit scripts and `cities.corrected.json` describe the original review workflow; those build-time inputs are not bundled here. `sha256.json` records their historical checksums, not the current runtime package. The app already embeds the reviewed city records in `data.js`; running or editing the app requires no external build input. Coverage evidence is maintained separately in the root coverage manifest.

## Result and exact scope

- All **19,436 retained places across 105 regions** were screened, including both English and native displays. Original baseline screening covered 7,360 places; the first expanded snapshot covered 19,425. Greenland's 15 were then included and four separately approved new ambiguous-country entries were excluded by the dataset owner before final QA.
- **636 display fields changed across 629 distinct place records**, in 46 countries/regions. There are 3134 total field changes across 773 records, including language/provenance and disambiguation metadata.
- All **200 Japanese native names** were crosschecked against same-prefecture official J-LIS municipality entries, with Tokyo explicitly retained as 東京. Zero unresolved Japan name mappings. The 170 changed native labels include 167 city-suffix consistency changes and three genuine wrong/truncated labels. Two English locality labels were also corrected. Full source evidence is in `japan_report.json` and `japan_patches.json`.
- Targeted live Wikidata checks requested 4,885 ID/language pairs and returned 3,867 label rows for 1,858 distinct GeoNames city IDs. Each retrieval and response is saved. These are corroboration, not municipal certification: mismatched entity links and stale labels were found and rejected.
- Final heuristic screening leaves 289 review candidates, **not 289 proven errors**. There are 943 explicitly documented fallback/corroborated flag dispositions. `unresolved_review.json` retains the remaining discrepancies, including valid short names, jurisdiction suffixes, romanization variants and possible remaining source errors.
- 3,695 records honestly show exact Unicode gazetteer **Source spelling** with `nativeLanguage=null` when no sufficiently supported local-language label was available. These are not claimed to be independently verified native text.
- Zero out-of-policy language tags remain. Stable IDs, coordinates, populations, ranks and the final region/place membership are preserved.

## Confirmed root cause

The old native selector sorted descending by `short`, `preferred`, and negative string length. It therefore explicitly preferred abbreviated names and then the shortest tied alias. Ichihara's 市原市 and erroneous 原 were both unflagged/unpreferred; 原 won solely because it was shorter. Similar behavior affected other countries. Preferred/short flags themselves are unreliable: unflagged nicknames, historic names and district labels are present in GeoNames. Blind longest-name selection is also wrong.

## Policy and integration

1. Use the corrected complete dataset as the integration source. Do not rerun old selection over it. `corrections.json` contains final before/after, stable ID, field and source URL for every changed field.
2. `name_policy.py` provides a curated display-language allowlist and regional choices for Canada, Belgium, Switzerland, India, Spain, Italy and the UK, while preserving official multilingual cases. It is a display policy, not an exhaustive legal inventory of every recognized minority language. GeoNames `countryInfo.languages` is never used as a blanket native-language permission list.
3. Prefer a current primary local-language label, corroborated exact source spelling, or a uniquely supported local-language source label. Retain supported official secondary-language names when a better primary label is unavailable. A foreign tourist/migrant-language alias is not an acceptable substitute.
4. No length heuristic. Historical/ended/colloquial entries are excluded upstream. Neither `preferred` nor `short` alone decides a winner. Ambiguous/unsupported cases retain exact primary Unicode source spelling with honest status rather than an invented translation.
5. Current official-source overrides win over both GeoNames and Wikidata. This matters for Kadiyivka, where Wikidata returned stale Стаханов, and for Bhutan, whose existing official-source corrections were protected.
6. Preserve these reviewed overrides in future rebuilds and recompute label disambiguation after applying them. The selector alone cannot replace city-specific evidence, because both source primary names and alternate-name flags sometimes contain errors.
7. `select_english_name` is a conservative build-time helper. It does not invent exonyms. Current-name overrides still apply afterward; historical original names remain in `originalName` for traceability.

Regional policy reference checks: [Belgian government communities](https://www.belgium.be/en/about_belgium/government/communities), [Flemish government language areas](https://www.vlaanderen.be/uw-overheid/over-vlaanderen/taalwetwijzer/taalgebieden-in-belgie), [Swiss federal multilingualism](https://www.aboutswitzerland.eda.admin.ch/en/multilingualism), [Swiss federal language geography](https://www.aboutswitzerland.eda.admin.ch/en/language). Existing region-aware Indian language mapping and explicit English-local scope were preserved.

## Representative corrections

| Place | Before | After | Evidence |
|---|---|---|---|
| Ichihara | 原 | 市原市 | Official municipality list and city site in Japan report |
| Yokkaichi | 四日 | 四日市市 | Official municipality list |
| Chōfu | 調布ヶ丘 | 調布市 | Official municipality list |
| Guatemala City | Guate | Ciudad de Guatemala | https://www.muniguate.com/ |
| Teboulba | ريج | طبلبة | https://www.commune-teboulba.gov.tn/ |
| Warin Chamrap | วาริน | วารินชำราบ | https://www.warincity.go.th/e-service/ |
| Bangkok | กรุงเทพฯ | กรุงเทพมหานคร | https://official.bangkok.go.th/?lang=th |
| Coimbatore | கோவை | கோயம்புத்தூர் | https://ccmc.gov.in/ |
| Tirupati | తిరుమల | తిరుపతి | Official source in India addendum |
| Rostov-on-Don | Ростов | Ростов-на-Дону | https://tourism.rostov-gorod.ru/?lang=ru |
| Mülheim | Mülheim | Mülheim an der Ruhr | https://www.muelheim-ruhr.de/ |
| Toufen | 頭份鎮 | 頭份市 | https://www.toufen.gov.tw/SiteMap.aspx |
| Moe | Yallourn | Moe | GeoNames primary + exact-ID Wikidata corroboration |
| Wandong | Heathcote Junction | Wandong | GeoNames primary + exact-ID Wikidata corroboration |
| Geneva | Genf | Genève | French-language primary regional source label |
| Liège | Luik | Liège | French-language primary regional source label |
| Port Blair | Port Blair / पोर्ट ब्लेयर | Sri Vijaya Puram / श्री विजयपुरम | Official council + 2026 Gazette in India addendum |

## Verification and remaining limits

`final_qa.py` checks exact final ID membership, all country counts and contiguous ranks, nonempty text, curated-language eligibility, honest fallback status, immutable coordinates/populations, and regression fixtures (including Ichihara, Los Angeles, Albuquerque, Valladolid, Mullingar, Geneva, Liège and Bolzano). All passed.

This audit fixes the selection class globally and records unresolved evidence honestly. It does **not** certify every place as a current independent municipality, every historical English name as current, every locality boundary, or every population. Some gazetteer rows represent city seats, townships, neighbourhoods or administrative entities; those entity-type and membership questions belong to the separate dataset/region QA. Native-name scripts and legitimate short names vary worldwide. No source discrepancy was silently converted into a fabricated translation.

## Additional entity-identity review

`duplicate_entity_review.json` records 13 same-local-name/same-admin1 pairs identified by independent read-only atlas QA. Some are close and may be duplicate aliases; others are far apart. Matching names and proximity alone do not establish duplicate identity. No forced membership or ID changes were made, and these pairs are not certified as distinct municipalities.
